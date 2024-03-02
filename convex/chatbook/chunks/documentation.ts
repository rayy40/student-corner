import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { load } from "cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { internal } from "../../_generated/api";

const visitedUrls = new Set();

const extractDocsUrl = (url: string) => {
  const commonDocs = ["docs", "documentation"];
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split("/");
  const baseUrl = parsedUrl.origin;
  let docsUrl = parsedUrl.origin;
  let previousSegmentWasDocs = false;
  let keyword = "";
  if (commonDocs.some((keyword) => baseUrl.includes(keyword))) {
    return { baseUrl, docsUrl };
  }
  for (const segment of pathSegments) {
    if (segment === "") continue;

    if (commonDocs.includes(segment.toLowerCase())) {
      keyword = segment.toLowerCase();
      previousSegmentWasDocs = true;
    }
    if (previousSegmentWasDocs) {
      break;
    }
    if (docsUrl !== parsedUrl.origin || !previousSegmentWasDocs) {
      docsUrl += "/" + segment;
    }
  }
  if (previousSegmentWasDocs) {
    docsUrl += `/${keyword}`;
  }

  return { baseUrl, docsUrl };
};

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  return html;
}

async function scrapeRecursively(
  url: string,
  scrapedContent: Promise<string | undefined>[]
): Promise<string> {
  const html = await fetchHTML(url);

  const $ = load(html);

  let result = "";

  $("body").each((_, element) => {
    $(element)
      .find("*")
      .each((_, el) => {
        if (el.tagName === "text") {
          result += $(el).text().trim() + " ";
          return;
        }
        const tagName = el.tagName;
        switch (tagName) {
          case "code":
            if ($(el).has("span").length > 0) {
              result +=
                "```\n" +
                $(el)
                  .children()
                  .map((_, line) => $(line).text())
                  .get()
                  .join("\n") +
                "\n```\n";
              return;
            }
            result += " `" + $(el).text() + "` ";
            return;
          case "a": {
            if ($(el).hasClass("hash-link")) {
              return;
            }
            let href = $(el).attr("href") || "";
            if (href.startsWith("/")) {
              href = extractDocsUrl(url).baseUrl + href;
              result += " [" + $(el).text() + "](" + href + ") ";
            }
            if (href.startsWith(extractDocsUrl(url).docsUrl)) {
              result += " [" + $(el).text() + "](" + href + ") ";
              if (!visitedUrls.has(href)) {
                visitedUrls.add(href);
                const promise = scrapeRecursively(href, scrapedContent);
                scrapedContent.push(promise);
              }
            }
            return;
          }
          case "strong":
          case "em":
            result += " " + $(el).text() + " ";
            return;
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
            result +=
              "#".repeat(parseInt(tagName.slice(1))) +
              " " +
              $(el).text() +
              "\n\n";
            return;
          default:
            return;
        }
      });
  });
  return result.trim();
}

export const scrapeWebsite = internalAction({
  args: { url: v.string(), chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    try {
      let scrapedContent: Promise<string | undefined>[] = [];
      visitedUrls.add(args.url);
      await scrapeRecursively(args.url, scrapedContent);
      const resolved = (await Promise.all(scrapedContent)).filter(Boolean);

      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chunks.documentation.splitChunks,
        {
          content: resolved as string[],
          chatId: args.chatId,
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

export const splitChunks = internalAction({
  args: { content: v.array(v.string()), chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    try {
      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 2000,
        chunkOverlap: 100,
      });

      const chunks = await splitter.createDocuments(args.content);

      for (let batchStart = 0; batchStart < chunks.length; batchStart += 100) {
        const batchEnd = Math.min(batchStart + 100, chunks.length);
        const batch = chunks
          .slice(batchStart, batchEnd)
          .map((c) => c.pageContent);

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
          title: "Website",
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
