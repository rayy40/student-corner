import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useQueryQuizProps = ({ quizId }: { quizId: Id<"quiz"> }) => {
  const data = useQuery(api.quiz.getQuizData, {
    quizId,
  });

  const loading = data === undefined || data === null;

  return {
    data,
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

export const useQueryChatProps = ({ chatId }: { chatId: Id<"chatbook"> }) => {
  const data = useQuery(api.chatbook.getEmbeddingId, {
    chatId,
  });

  const loading = data === undefined || data === null;

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
  const data = useQuery(api.chatbook.getChatHistory, {
    userId,
  });

  const loading = data === undefined;

  return {
    data,
    loading,
  };
};

export const useQueryGithubFileProps = ({
  chatId,
}: {
  chatId: Id<"chatbook">;
}) => {
  const data = useQuery(api.chatbook.getGithubFiles, {
    chatId,
  });

  const loading = data === undefined;

  return {
    data,
    loading,
  };
};
