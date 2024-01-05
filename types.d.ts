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
