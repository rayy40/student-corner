"use node";

import { v } from "convex/values";
import ignore from "ignore";

import { ignoredExtensions } from "@/convex/lib/utils";
import { Github } from "@/lib/types";
import { Octokit } from "@octokit/rest";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
let gitIgnoreContent: string;

export const isIgnored = ({
  name,
  path,
  gitIgnore,
}: {
  name: string;
  path: string;
  gitIgnore: string;
}) => {
  const gitIgnoreInstance = ignore().add(gitIgnore);
  const extension = name.substring(name.lastIndexOf(".")).toLowerCase();
  const ignored =
    name.startsWith(".") ||
    gitIgnoreInstance.ignores(path) ||
    ignoredExtensions.includes(extension);
  return ignored;
};

const parseUrl = (url: string): { owner: string; repo: string } => {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  const parts = url.split("/");
  return { owner: parts[3], repo: parts[4] };
};

const getFileContent = async ({
  owner,
  repo,
  path,
}: {
  path: string;
  owner: string;
  repo: string;
}) => {
  const { data: fileData } = await octokit.rest.repos.getContent({
    owner: owner,
    repo: repo,
    path: path,
  });

  if (!Array.isArray(fileData) && fileData.type === "file") {
    if (fileData.encoding === "base64") {
      const content = Buffer.from(fileData.content, "base64").toString("ascii");
      return {
        name: fileData.name,
        path: fileData.path,
        html_url: fileData.html_url ?? undefined,
        content,
        download_url: fileData.download_url ?? undefined,
      };
    }
    return;
  }
};

export const getGitIgnoreContent = async (
  repoData: any[],
  owner: string,
  repo: string
): Promise<string> => {
  const gitIgnorePath = repoData.find(
    (item) => item.type === "file" && item.name === ".gitignore"
  );
  if (gitIgnorePath) {
    const { data: gitIgnoreData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: ".gitignore",
    });
    return !Array.isArray(gitIgnoreData) && gitIgnoreData.type === "file"
      ? atob(gitIgnoreData.content)
      : gitIgnoreContent;
  }
  return gitIgnoreContent;
};

const fetchFilesRecursively = async ({
  owner,
  repo,
  path,
}: {
  owner: string;
  repo: string;
  path: string;
}): Promise<Github[] | undefined> => {
  const { data: repoData } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if (Array.isArray(repoData)) {
    gitIgnoreContent = await getGitIgnoreContent(repoData, owner, repo);
    const filePromises = repoData.map(async (item) => {
      if (
        item.type === "file" &&
        !isIgnored({
          path: item.path,
          gitIgnore: gitIgnoreContent,
          name: item.name,
        })
      ) {
        return getFileContent({ owner, repo, path: item.path });
      } else if (
        item.type === "dir" &&
        !isIgnored({
          path: item.path,
          gitIgnore: gitIgnoreContent,
          name: item.name,
        })
      ) {
        return fetchFilesRecursively({ owner, repo, path: item.path });
      }
      return null;
    });

    const files = await Promise.all(filePromises);

    return files
      .flat()
      .filter((file) => file !== null && file !== undefined) as Github[];
  }
  return [];
};

export const getFilesFromRepo = internalAction({
  args: {
    url: v.string(),
    path: v.string(),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, { url, path, chatId }) => {
    try {
      const chat = await ctx.runQuery(internal.chatbook.chat.isExistingUrl, {
        url,
      });

      //TODO: add private repos support

      if (chat) {
        await ctx.runMutation(internal.chatbook.chat.updateExistingChat, {
          chatId,
          existingId: chat._id,
        });
        return;
      }

      const { owner, repo } = parseUrl(url);

      const files = await fetchFilesRecursively({
        owner,
        repo,
        path,
      });

      if (!files) {
        throw Error("No files found.");
      }

      const content = files
        .map((file) => file.content)
        .filter(Boolean) as string[];

      await ctx.runMutation(internal.chatbook.chat.patchFiles, {
        chatId,
        files,
      });

      await ctx.scheduler.runAfter(0, internal.chatbook.github.createChunks, {
        chatId,
        content,
        title: repo,
      });
    } catch (error) {
      await ctx.runMutation(internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "There was an error while fetching files from the repository.",
      });
    }
  },
});

export const createChunks = internalAction({
  args: {
    chatId: v.id("chatbook"),
    title: v.string(),
    content: v.array(v.string()),
  },
  handler: async (ctx, { chatId, title, content }) => {
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 100,
        separators: ["\n", "\n\n", "\r\n", "\r", " ", ""],
      });

      const docs = await splitter.createDocuments(content);

      const chunks = docs.map((doc) => doc.pageContent);

      await ctx.scheduler.runAfter(0, internal.chatbook.chunks.insertChunks, {
        chunks,
        chatId,
        title,
      });
    } catch (error) {
      await ctx.runMutation(internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "Unable to create chunks from the provided text.",
      });
    }
  },
});
