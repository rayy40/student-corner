import { Message } from "ai";
import { Infer } from "convex/values";
import {
  FieldErrors,
  FieldValues,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

import { Github, Response } from "./convex/schema";
import { quizSchema } from "./schema/quiz_schema";
import { Dispatch, SetStateAction } from "react";
import {
  youtubeSchema,
  codebaseSchema,
  filesSchema as ChatFilesSchema,
  documentationSchema,
} from "./schema/chat_schema";
import {
  topicSchema,
  paragraphSchema,
  filesSchema as QuizFilesSchema,
} from "./schema/quiz_schema";

export type CodebaseSchema = z.infer<typeof codebaseSchema>;
export type YoutubeSchema = z.infer<typeof youtubeSchema>;
export type DocumentationSchema = z.infer<typeof documentationSchema>;
export type ChatFilesSchema = z.infer<typeof ChatFilesSchema>;
export type TopicSchema = z.infer<typeof topicSchema>;
export type ParagraphSchema = z.infer<typeof paragraphSchema>;
export type QuizFilesSchema = z.infer<typeof QuizFilesSchema>;

export type ChatSchemaSelection =
  | "codebase"
  | "files"
  | "documentation"
  | "youtube";
export type QuizSchemaSelection = "topic" | "paragraph" | "files";

export type FormatType = "mcq" | "name" | "true_false";

export type UserAnswers = {
  [key: string]: string;
};

export type SelectedOptions = {
  key: number;
  value: string;
}[];

export type ResponseData = Infer<typeof Response>;
export type MessageData = Infer<typeof Message>;
export type GithubFilesData = Infer<typeof Github> & {
  _id: Id<"github">;
  chatId: Id<"chatbook">;
  _creationTime: number;
};

export interface GameData {
  _id: Id<"quiz">;
  _creationTime: number;
  content: string;
  format: "mcq" | "name" | "true_false";
  kind: "topic" | "paragraph" | "document";
  questionNumber: number;
  response?: ResponseData | string;
  result?: {
    correctAnswer: number;
    score: number;
  };
  title?: string;
  userId: Id<"users">;
}

interface QuizData {
  yourAnswer?: string | undefined;
  options?: string[] | undefined;
  question: string;
  answer: string;
}

export interface CreateUserPrompt {
  format: FormatType;
  questionNumber: number;
  content: string;
  kind: string;
}

export interface ChatData {
  _id: Id<"chatbook">;
  _creationTime: number;
  url: string;
  type?: "doc" | "code" | "video";
  title?: string;
  chat?: MessageType[];
  userId: Id<"users">;
  embeddingId?: ID<"chatEmbeddings">[];
}

export interface MessageType {
  tool_call_id?: string;
  ui?: any;
  url?: string;
  content: string;
  id: string;
  role: "function" | "system" | "user" | "assistant" | "data" | "tool";
}

export interface DocumentType<K extends string> {
  kind: K;
  format: K extends "quiz" ? QuizSchemaSelection : ChatSchemaSelection;
  isSubmitted: boolean;
  register: K extends "quiz"
    ? UseFormRegister<TopicSchema | ParagraphSchema | QuizFilesSchema>
    : UseFormRegister<
        YoutubeSchema | DocumentationSchema | ChatFilesSchema | CodebaseSchema
      >;
  errors: K extends "quiz"
    ? FieldErrors<TopicSchema | ParagraphSchema | QuizFilesSchema>
    : FieldErrors<
        YoutubeSchema | DocumentationSchema | ChatFilesSchema | CodebaseSchema
      >;
}

export interface DropDownType<K extends string> {
  kind: K;
  value: K extends "quiz" ? QuizSchemaSelection : ChatSchemaSelection;
  lists: string[];
  reset: UseFormReset<FieldValues>;
  setError: Dispatch<SetStateAction<string>>;
  setValue: UseFormSetValue<FieldValues>;
  setFormSchema: K extends "quiz"
    ? Dispatch<SetStateAction<QuizSchemaSelection>>
    : Dispatch<SetStateAction<ChatSchemaSelection>>;
}

export interface DynamicFormType<K extends string> {
  kind: K;
  selectedSchema: K extends "quiz" ? QuizSchemaSelection : ChatSchemaSelection;
}

export interface AddEmbedding {
  chatId: Id<"chatbook">;
  content: string;
  source: string;
  embedding: number[];
  title: string;
  type: "code" | "video" | "doc";
}
export interface DashboardType<K extends string> {
  type: K;
  data: K extends "quiz" ? GameData[] : ChatData[];
}

export interface Document {
  pageContent: string;
  metadata: string;
}

export interface FilePath {
  id: string;
  path: string;
  content: string;
}

export interface GithubFileObject {
  name: string;
  content: string;
  path: string;
  html_url: string | undefined;
  download_url: string | undefined;
}

type Node = {
  name: string;
  children: Node[];
  metadata: {
    path: string;
    id: string;
  };
};

export type TreeStructure = Node;

export type ScheduledFunctionsStatus =
  | {
      kind: "pending";
    }
  | {
      kind: "inProgress";
    }
  | {
      kind: "success";
    }
  | {
      kind: "failed";
      error: string;
    }
  | {
      kind: "canceled";
    }
  | null;
