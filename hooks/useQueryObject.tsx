import { useConvex, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { MessageData } from "@/types";

export const useQueryQuizProps = ({ quizId }: { quizId: Id<"quiz"> }) => {
  let loading = true;

  const quiz = useQuery(api.quiz.index.getQuizData, {
    quizId,
  });

  if (quiz?.status !== "inProgress" && quiz !== null && quiz !== undefined) {
    loading = false;
  }

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
  let loading = true;

  const data = useQuery(api.quiz.index.getQuizHistory, {
    userId,
  });

  if (data !== null && data !== undefined) {
    loading = false;
  }

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
  let loading = true;

  const data = useQuery(api.chatbook.conversations.getChatsHistory, {
    userId,
  });

  if (data !== null && data !== undefined) {
    loading = false;
  }

  return {
    data,
    loading,
  };
};

export const useQueryChatDetailsProps = ({
  chatId,
}: {
  chatId: Id<"chatbook">;
}) => {
  let loading = true;

  const data = useQuery(api.chatbook.index.getChatDetails, { chatId });

  if (data?.status !== "inProgress" && data !== null && data !== undefined) {
    loading = false;
  }

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
  let loading = true;

  const data = useQuery(api.chatbook.index.getGithubFiles, { chatId });

  if (data !== null && data !== undefined) {
    loading = false;
  }

  if (data?.length == 0) {
    return { data: "No files found for this repo.", loading: false };
  }

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
      const response = await convex.query(
        api.chatbook.conversations.getConversation,
        {
          chatId,
        }
      );
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
