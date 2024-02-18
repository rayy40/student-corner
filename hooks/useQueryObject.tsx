import { useConvex, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { MessageData } from "@/types";

export const useQueryQuizProps = ({ quizId }: { quizId: Id<"quiz"> }) => {
  const quiz = useQuery(api.quiz.getQuizData, {
    quizId,
  });

  const loading = quiz === undefined;

  return {
    quiz,
    loading,
  };
};

export const useQueryQuizHistoryProps = ({
  userId,
}: {
  userId: Id<"users">;
}) => {
  const data = useQuery(api.quiz.getQuizHistory, {
    userId,
  });

  const loading = data === undefined;

  return {
    data,
    loading,
  };
};

export const useQueryChatHistoryProps = ({
  userId,
}: {
  userId: Id<"users">;
}) => {
  const data = useQuery(api.conversations.getChatsHistory, {
    userId,
  });

  const loading = data === undefined;

  return {
    data,
    loading,
  };
};

export const useQueryEmbeddingProps = ({
  chatId,
}: {
  chatId: Id<"chatbook">;
}) => {
  const data = useQuery(api.chatbook.getChatDetails, { chatId });

  const loading = data === undefined;

  return {
    data,
    loading,
  };
};

export const useQueryGithubRepoProps = ({
  chatId,
}: {
  chatId: Id<"chatbook">;
}) => {
  const data = useQuery(api.chatbook.getGithubFiles, { chatId });

  const loading = data === undefined;

  return {
    data,
    loading,
  };
};

export const useConversationHistory = (chatId: Id<"chatbook">) => {
  const convex = useConvex();
  const [conversationHistory, setConversationHistory] = useState<MessageData[]>(
    []
  );

  useMemo(() => {
    if (!chatId) return;

    const fetchData = async () => {
      const response = await convex.query(api.conversations.getConversation, {
        chatId,
      });
      if (!response) {
        setConversationHistory([]);
      } else {
        setConversationHistory(response);
      }
    };
    fetchData();
  }, [chatId, convex]);

  return conversationHistory;
};
