"use server";

import { redirect } from "next/navigation";
import { FieldValues } from "react-hook-form";

import { Id } from "@/convex/_generated/dataModel";
import { createQuiz, updateUserAnswers } from "@/db/quiz";
import { generateUploadUrl } from "@/db/utils";
import {
  QuizFormat,
  QuizGameQuestionProps,
  QuizSchemaSelection,
} from "@/lib/types";
import { paragraphSchema, topicSchema } from "@/schema/quiz_schema";

export const topic = async (values: FieldValues, userId?: string) => {
  const validatedFields = topicSchema.safeParse(values);

  if (!userId) {
    return { error: "You need to login before creating a quiz." };
  }

  if (!validatedFields.success) {
    return { error: "Invdalid fields" };
  }

  const { topic, questions, format } = validatedFields.data;

  const id = await createQuiz({
    questions,
    format,
    content: topic,
    kind: "topic",
    userId: userId as Id<"users">,
  });

  if (!id) {
    return { error: "Unable to generate quiz, please try again." };
  }

  redirect(`/quiz/topic/${id}`);
};

export const paragraph = async (values: FieldValues, userId?: string) => {
  const validatedFields = paragraphSchema.safeParse(values);

  if (!userId) {
    return { error: "You need to login before creating a quiz." };
  }

  if (!validatedFields.success) {
    return { error: "Invdalid fields" };
  }

  const { paragraph, questions, format } = validatedFields.data;

  const id = await createQuiz({
    questions,
    format,
    content: paragraph,
    kind: "paragraph",
    userId: userId as Id<"users">,
  });

  if (!id) {
    return { error: "Unable to generate quiz, please try again." };
  }

  redirect(`/quiz/paragraph/${id}`);
};

export const files = async (values: FormData, userId?: string) => {
  const files = values.get("files");
  const questions = Number(values.get("questions"));
  const format = values.get("format") as QuizFormat;

  if (!userId) {
    return { error: "You need to login before creating a quiz." };
  }

  if (!files) {
    return { error: "No files provided." };
  }

  if (!questions) {
    return { error: "Need to enter the no. of questions." };
  }

  if (!format) {
    return { error: "Have to chose a format." };
  }

  const url = await generateUploadUrl();

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: files,
  });

  if (!response.ok) {
    throw Error("Something went wrong while uploading the file.");
  }

  const { storageId } = await response.json();

  const id = await createQuiz({
    questions,
    format,
    content: storageId,
    kind: "files",
    userId: userId as Id<"users">,
  });

  if (!id) {
    return { error: "Unable to generate quiz, please try again." };
  }

  redirect(`/quiz/files/${id}`);
};

export const updateAnswers = async (
  userAnswers: QuizGameQuestionProps[],
  type: QuizSchemaSelection,
  quizId: Id<"quiz">,
  userId: string
) => {
  if (!userId) {
    return { error: "You need to login before playing a quiz." };
  }

  if (!quizId) {
    return { error: "You need to create a quiz first." };
  }

  if (!userAnswers) {
    return { error: "No answers provided." };
  }

  const score = userAnswers.reduce((acc, currentAnswer) => {
    if (
      currentAnswer?.answer.trim().toLowerCase() ===
      currentAnswer?.yourAnswer?.trim().toLowerCase()
    ) {
      acc++;
    }
    return acc;
  }, 0);

  const res = await updateUserAnswers({
    quizId,
    userAnswers,
    score,
  });

  if (res?.error) {
    return { error: res.error };
  }

  redirect(`/quiz/${type}/${quizId}/result`);
};
