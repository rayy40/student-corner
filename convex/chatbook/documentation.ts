import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

import { v } from "convex/values";
import { load } from "cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const visitedUrls = new Set();

function extractBaseUrl(url: string): { title: string; baseUrl: string } {
  const parsedUrl = new URL(url);
  const baseUrl = parsedUrl.origin;
  const hostname = parsedUrl.hostname;

  let title = "";
  const hostnameSegments = hostname.split(".");

  if (hostnameSegments.length > 2) {
    title = hostnameSegments[hostnameSegments.length - 2];
  } else {
    title = hostnameSegments[0];
  }

  title += " docs";

  return { title, baseUrl };
}

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  return html;
}

async function scrapeRecursively(
  url: string,
  scrapedContent: Promise<string>[],
  baseUrl: string
): Promise<string> {
  try {
    const html = await fetchHTML(url);
    const $ = load(html);

    let result = "";

    $("body")
      .find("*")
      .each((_, el) => {
        const $el = $(el);
        const tagName = el.tagName.toLowerCase();

        switch (tagName) {
          case "text":
            result += $el.text().trim() + " ";
            break;
          case "code":
            if ($el.has("span").length > 0) {
              result +=
                "```\n" +
                $el
                  .children()
                  .map((_, line) => $(line).text())
                  .get()
                  .join("\n") +
                "\n```\n";
            } else {
              result += " `" + $(el).text() + "` ";
            }
            break;
          case "a": {
            if ($el.hasClass("hash-link")) return;

            let href = $el.attr("href") || "";
            if (href.startsWith("/")) href = `${baseUrl}${href}`;

            const isInternalLink = href.startsWith(baseUrl);
            result += ` [${$el.text()}](${href}) `;

            if (isInternalLink && !visitedUrls.has(href)) {
              visitedUrls.add(href);
              const promise = scrapeRecursively(href, scrapedContent, baseUrl);
              scrapedContent.push(promise);
            }
            break;
          }
          case "strong":
          case "em":
            result += ` ${$el.text()} `;
            break;
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
            result += `${"#".repeat(parseInt(tagName.slice(1), 10))} ${$el.text()}\n\n`;
            break;
          default:
            break;
        }
      });
    return result.trim();
  } catch (error) {
    return "";
  }
}

export const scrapeWebsite = internalAction({
  args: { url: v.string(), chatId: v.id("chatbook") },
  handler: async (ctx, { url, chatId }) => {
    try {
      const { title, baseUrl } = extractBaseUrl(url);

      let scrapedContent: Promise<string>[] = [];
      visitedUrls.add(url);

      const initialContent = await scrapeRecursively(
        url,
        scrapedContent,
        baseUrl
      );
      scrapedContent.push(Promise.resolve(initialContent));

      const content = await Promise.all(scrapedContent);

      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.documentation.createChunks,
        {
          content,
          chatId,
          title,
        }
      );
    } catch (error) {
      await ctx.runMutation(internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});

export const createChunks = internalAction({
  args: {
    content: v.array(v.string()),
    chatId: v.id("chatbook"),
    title: v.string(),
  },
  handler: async (ctx, { content, chatId, title }) => {
    try {
      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 2000,
        chunkOverlap: 100,
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
