"use node";

import { v } from "convex/values";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import ignore from "ignore";

import { Octokit } from "@octokit/rest";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { GithubFileObject } from "@/types";
import { Github } from "@/convex/schema";
import { ignoredExtensions } from "@/convex/helper/utils";

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

const splitCode = async (docs: GithubFileObject[]) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 100,
  });

  const content = docs.map((doc) => doc.content);

  const chunks = await splitter.createDocuments(content);

  return chunks.map((chunk) => chunk.pageContent);
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
    const obj = {
      name: fileData.name,
      path: fileData.path,
      html_url: fileData.html_url ?? undefined,
      content: atob(fileData.content),
      download_url: fileData.download_url ?? undefined,
    };
    return obj;
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
}): Promise<GithubFileObject[] | undefined> => {
  const { data: repoData } = await octokit.rest.repos.getContent({
    owner: owner,
    repo: repo,
    path: path,
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
      .filter(
        (file) => file !== null && file !== undefined
      ) as GithubFileObject[];
  }
  return [];
};

export const getFilesFromRepo = internalAction({
  args: {
    repoUrl: v.string(),
    filePath: v.string(),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    try {
      const { owner, repo } = parseUrl(args.repoUrl);

      const files = await fetchFilesRecursively({
        owner,
        repo,
        path: args.filePath,
      });

      if (files) {
        await ctx.scheduler.runAfter(
          0,
          internal.chatbook.chunks.codebase.patchFiles,
          {
            chatId: args.chatId,
            files,
            title: repo,
          }
        );
      }
    } catch (error) {
      await ctx.runMutation(internal.chatbook.index.updateChatbookStatus, {
        chatId: args.chatId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});

export const patchFiles = internalAction({
  args: { chatId: v.id("chatbook"), files: v.array(Github), title: v.string() },
  handler: async (ctx, args) => {
    try {
      for (
        let batchStart = 0;
        batchStart < args.files.length;
        batchStart += 100
      ) {
        const batchEnd = Math.min(batchStart + 100, args.files.length);
        const batch = args.files.slice(batchStart, batchEnd);

        await ctx.runMutation(internal.chatbook.index.patchGithubFiles, {
          chatId: args.chatId,
          files: batch,
        });
      }

      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chunks.codebase.splitAndAddChunks,
        {
          chatId: args.chatId,
          files: args.files,
          title: args.title,
        }
      );
    } catch (error) {
      await ctx.runMutation(internal.chatbook.index.updateChatbookStatus, {
        chatId: args.chatId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});

export const splitAndAddChunks = internalAction({
  args: { chatId: v.id("chatbook"), files: v.array(Github), title: v.string() },
  handler: async (ctx, args) => {
    try {
      const chunks = await splitCode(args.files as GithubFileObject[]);

      for (let batchStart = 0; batchStart < chunks.length; batchStart += 200) {
        const batchEnd = Math.min(batchStart + 100, chunks.length);
        const batch = chunks.slice(batchStart, batchEnd);

        await ctx.runMutation(internal.helper.chunks.addChunks, {
          chatId: args.chatId,
          chunks: batch,
        });
      }

      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.embedding.generateEmbeddings,
        {
          chatId: args.chatId,
          title: args.title,
        }
      );
    } catch (error) {
      await ctx.runMutation(internal.chatbook.index.updateChatbookStatus, {
        chatId: args.chatId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});
