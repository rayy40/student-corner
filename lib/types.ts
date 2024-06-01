import { Doc, Id } from "@/convex/_generated/dataModel";
import { QuizFormat, QuizKind, Response } from "@/convex/schema";
import { Infer } from "convex/values";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import {
  youtubeSchema,
  githubSchema,
  filesSchema as chatFilesSchema,
  documentationSchema,
  conversationSchema,
} from "@/schema/chat_schema";
import {
  topicSchema,
  paragraphSchema,
  filesSchema as quizFilesSchema,
} from "@/schema/quiz_schema";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";

export type QuizKind = Infer<typeof QuizKind>;
export type QuizFormat = Infer<typeof QuizFormat>;
export type QuizGameResponseProps = Infer<typeof Response>;

export type githubSchema = z.infer<typeof githubSchema>;
export type YoutubeSchema = z.infer<typeof youtubeSchema>;
export type DocumentationSchema = z.infer<typeof documentationSchema>;
export type ChatFilesSchema = z.infer<typeof chatFilesSchema>;
export type TopicSchema = z.infer<typeof topicSchema>;
export type ParagraphSchema = z.infer<typeof paragraphSchema>;
export type QuizFilesSchema = z.infer<typeof quizFilesSchema>;
export type ConversationSchema = z.infer<typeof conversationSchema>;

export type Quiz = Doc<"quiz">;
export type Chat = Doc<"chatbook">;
export type Github = Doc<"github">;

export type PreloadedChat = Preloaded<typeof api.chatbook.chat.getChat>;

export type ChatSchemaSelection =
  | "github"
  | "files"
  | "documentation"
  | "youtube";
export type QuizSchemaSelection = "topic" | "paragraph" | "files";

export type CreateQuizProps = {
  userId: Id<"users">;
  questions: number;
  content: string;
  kind: QuizKind;
  format: QuizFormat;
};

export type CreateUserPrompt = {
  format: QuizFormat;
  numberOfQuestions: number;
  content: string;
  kind: string;
};

export type QuizGameQuestionProps = {
  yourAnswer?: string | undefined;
  options?: string[] | undefined;
  question: string;
  answer: string;
};

export type updateUserAnswerProps = {
  quizId: Id<"quiz">;
  userAnswers: QuizGameQuestionProps[];
  score: number;
};

export type QuizGameFormats = {
  item?: QuizGameQuestionProps;
  userAnswers?: QuizGameQuestionProps[];
  setUserAnswers: Dispatch<SetStateAction<QuizGameQuestionProps[] | undefined>>;
  questionNumber: number;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type DropDownType = {
  value: string;
  lists: string[];
};

export type FormType = {
  kind: "chat" | "quiz";
  title: string;
  schema: string;
  types: string[];
  children: React.ReactNode;
};

export interface DocumentType<K extends string> {
  kind: K;
  format: K extends "quiz" ? QuizSchemaSelection : ChatSchemaSelection;
  isSubmitted: boolean;
  register: K extends "quiz"
    ? UseFormRegister<TopicSchema | ParagraphSchema | QuizFilesSchema>
    : UseFormRegister<
        YoutubeSchema | DocumentationSchema | ChatFilesSchema | githubSchema
      >;
  errors: K extends "quiz"
    ? FieldErrors<TopicSchema | ParagraphSchema | QuizFilesSchema>
    : FieldErrors<
        YoutubeSchema | DocumentationSchema | ChatFilesSchema | githubSchema
      >;
}

export interface DashboardType<K extends string> {
  type: K;
  data: K extends "quiz" ? Quiz[] : Chat[];
}

export type MessageRole =
  | "function"
  | "data"
  | "system"
  | "user"
  | "assistant"
  | "tool";

export type ChatMessage = {
  id: string;
  createdAt: number;
  content: string;
  role: MessageRole;
};

export type Node = {
  name: string;
  children: Node[];
  metadata: {
    path: string;
    id: string;
  };
};

export type TreeStructure = Node;

export const isQuizData = (item: Quiz | Chat): item is Quiz => {
  return "numberOfQuestions" in item;
};
