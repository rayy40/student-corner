"use node";

import { ConvexError, Infer, v } from "convex/values";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { minimatch } from "minimatch";
import path from "path";

import { Octokit } from "@octokit/rest";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { Github as _Github } from "./schema";

type Github = Infer<typeof _Github>;

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

async function* fetchFilesRecursively(
  ignoreFiles: string[],
  owner: string,
  repo: string,
  filePath: string
): AsyncGenerator<Github, void, undefined> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: filePath,
  });

  for (const file of Array.isArray(data) ? data : [data]) {
    if (
      file.name.startsWith(".") ||
      ignoreFiles.some((pattern) => minimatch(file.name, pattern))
    ) {
      console.warn("File doesn't fit parsing pattern:", file.name);
      continue;
    }

    if (file.type === "file") {
      try {
        const doc = await extractCode(file.download_url!);
        const document: Github = {
          name: file.name,
          url: file.url,
          path: file.path,
          download_url: file.download_url!,
          content: doc[0].pageContent ?? "",
        };
        yield document;
      } catch (error) {
        console.error(`Error extracting code from ${file.name}:`, error);
        throw new ConvexError((error as Error).message);
      }
    } else if (file.type === "dir") {
      yield* fetchFilesRecursively(ignoreFiles, owner, repo, file.path);
    }
  }
}

const getAllFiles = async (
  ignoreFiles: string[],
  owner: string,
  repo: string,
  filePath: string
): Promise<Github[]> => {
  const files: Github[] = [];
  for await (const file of fetchFilesRecursively(
    ignoreFiles,
    owner,
    repo,
    filePath
  )) {
    files.push(file);
  }
  return files;
};

const getIgnoreFiles = async (
  owner: string,
  repo: string,
  filePath: string
): Promise<string[]> => {
  try {
    const { data: gitIgnoreData } = await octokit.rest.repos.getContent({
      owner: owner,
      repo: repo,
      path: ".gitignore",
    });

    if (!Array.isArray(gitIgnoreData) && gitIgnoreData.type === "file") {
      const gitIgnoreContent = atob(gitIgnoreData.content);
      const ignoreFiles = gitIgnoreContent
        .split(/\r?\n/)
        .filter((line) => !!line.trim() && !line.trim().startsWith("#"))
        .map((pattern) => (path.join(filePath), pattern.trim()));
      return ignoreFiles;
    }
    return [];
  } catch (error) {
    console.warn((error as Error).message);
    return [];
  }
};

const extractCode = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const loader = new TextLoader(blob);
    const doc = await loader.load();
    return doc;
  } catch (error) {
    console.error("Error extracting code:", error);
    throw new ConvexError((error as Error).message);
  }
};

const splitCode = async (files: Github[]) => {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const content = files.map((file) => file.content!);
  const chunks = await splitter.createDocuments(content);

  const texts = chunks.map((chunk) => chunk.pageContent);

  return texts;
};

export const getFilesFromRepo = internalAction({
  args: {
    repoUrl: v.string(),
    filePath: v.string(),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    const parts = args.repoUrl.split("/");
    const owner = parts[3];
    const repo = parts[4];

    const ignoreFiles = await getIgnoreFiles(owner, repo, args.filePath);

    const files = await getAllFiles(ignoreFiles, owner, repo, args.filePath);

    await ctx.runMutation(internal.chatbook.patchGithubFiles, {
      files,
    });

    const chunks = await splitCode(files);

    await ctx.scheduler.runAfter(0, internal.chatbook.generateEmbeddings, {
      chatId: args.chatId,
      chunks,
      title: repo,
      type: "code",
    });
  },
});
