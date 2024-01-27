import { Infer } from "convex/values";
import { Response } from "./convex/schema";
import {
  UseFormRegister,
  FieldErrors,
  UseFormReset,
  UseFormSetValue,
} from "react-hook-form";
import { quizSchema } from "./schema/quiz_schema";
import { chatSchema } from "./schema/chat_schema";
import { z } from "zod";

type quizSchema = z.infer<typeof quizSchema>;
type chatSchema = z.infer<typeof chatSchema>;

export type UserAnswers = {
  [key: string]: string;
};

export type FormatType = "mcq" | "name" | "true_false";

export type SelectedOptions = {
  key: number;
  value: string;
}[];

export type ResponseData = Infer<typeof Response>;

export type GameData = {
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
};

interface ResponseType {
  fallbackData: GameData | undefined;
  quizData: GameData | undefined | null;
  isGeneratingQuiz: boolean;
  invalidQuizId: boolean;
  idNotFound: boolean;
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

export interface DocumentType<K extends string> {
  kind: K;
  format: K extends "quiz"
    ? "topic" | "paragraph" | "document"
    : "link" | "document";
  isSubmitted: boolean;
  register: K extends "quiz"
    ? UseFormRegister<quizSchema>
    : UseFormRegister<chatSchema>;
  errors: K extends "quiz" ? FieldErrors<quizSchema> : FieldErrors<chatSchema>;
}

export interface DropDownType<K extends string> {
  kind: K;
  value: string;
  lists: string[];
  reset?: K extends "quiz"
    ? UseFormReset<quizSchema>
    : UseFormReset<chatSchema>;
  setValue?: K extends "quiz"
    ? UseFormSetValue<quizSchema>
    : UseFormSetValue<chatSchema>;
}
