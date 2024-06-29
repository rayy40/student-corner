import { Message } from "ai";
import {
  fetchAction,
  fetchMutation,
  fetchQuery,
  preloadQuery,
} from "convex/nextjs";
import { customAlphabet } from "nanoid";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatSchemaSelection, MessageRole } from "@/lib/types";

export const createChat = ({
  userId,
  url,
  domain,
  type,
}: {
  userId: Id<"users">;
  url: string;
  domain?: string;
  type: ChatSchemaSelection;
}) => {
  return fetchMutation(api.chatbook.chat.createChatbook, {
    userId,
    domain,
    url,
    type,
  });
};

export const patchMessages = ({
  chatId,
  userMessage,
  aiMessage,
}: {
  chatId: Id<"chatbook">;
  userMessage: string;
  aiMessage: Message;
}) => {
  let date = new Date().getTime();
  if (aiMessage.createdAt) {
    date = new Date(aiMessage.createdAt).getTime();
  }

  const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);

  const userId = nanoid();

  const aiMessageObject = {
    ...aiMessage,
    createdAt: date,
  };

  const userMessageObject = {
    id: userId,
    role: "user" as MessageRole,
    content: userMessage,
    createdAt: date,
  };

  return fetchMutation(api.chatbook.conversations.patchMessages, {
    chatId,
    messages: [userMessageObject, aiMessageObject],
  });
};

export const getMessages = ({ chatId }: { chatId: Id<"chatbook"> }) => {
  return fetchQuery(api.chatbook.conversations.getMessages, { chatId });
};

export const getPreloadedMessages = (chatId: Id<"chatbook">) => {
  return preloadQuery(api.chatbook.conversations.getMessages, { chatId });
};

export const getPreloadedChat = (chatId: Id<"chatbook">) => {
  return preloadQuery(api.chatbook.chat.getChat, { chatId });
};

export const getPreloadedFiles = (chatId: Id<"chatbook">) => {
  return preloadQuery(api.chatbook.chat.getGithubFiles, { chatId });
};

export const semanticSearch = (chatId: Id<"chatbook">, query: string) => {
  return fetchAction(api.chatbook.search.semanticSearch, {
    chatId,
    query,
  });
};

export const getGithubFiles = (chatId: Id<"chatbook">) => {
  return fetchQuery(api.chatbook.chat.getGithubFiles, { chatId });
};

export const getChatHistory = (userId: Id<"users">) => {
  return fetchQuery(api.chatbook.chat.getChatHistory, { userId });
};
