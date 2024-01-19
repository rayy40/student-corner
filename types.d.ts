import { Infer } from "convex/values";
import { Response } from "./convex/schema";

export interface TopicTypes {
  topic: string;
  by: "topic" | "paragraph" | "document";
  questions: number;
  format: "mcq" | "name" | "true_false";
}

export interface ParagraphTypes {
  paragraph: string;
  by: "topic" | "paragraph" | "document";
  questions: number;
  format: "mcq" | "name" | "true_false";
}

export interface DocumentTypes {
  document: FileList;
  by: "topic" | "paragraph" | "document";
  questions: number;
  format: "mcq" | "name" | "true_false";
}

export type QuestionType = TopicTypes | ParagraphTypes | DocumentTypes;

export type UserAnswers = {
  [key: string]: string;
};

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
