"use server";

import { redirect } from "next/navigation";

import { Id } from "@/convex/_generated/dataModel";
import { createQuiz, updateUserAnswers } from "@/db/quiz";
import { QuizGameQuestionProps } from "@/lib/types";
import { paragraphSchema, topicSchema } from "@/schema/quiz_schema";
import { ParagraphSchema, TopicSchema } from "@/types";

export const topic = async (values: TopicSchema, userId?: string) => {
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

  redirect(`/quiz/${id}`);
};

export const paragraph = async (values: ParagraphSchema, userId?: string) => {
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

  redirect(`/quiz/${id}`);
};

export const updateAnswers = async (
  userAnswers: QuizGameQuestionProps[],
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

  //TOOD: redirect to result page
};
