import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CreateQuizProps, updateUserAnswerProps } from "@/lib/types";
import { fetchMutation, fetchQuery, preloadQuery } from "convex/nextjs";

export const createQuiz = ({
  userId,
  questions,
  content,
  kind,
  format,
}: CreateQuizProps) => {
  return fetchMutation(api.quizify.quiz.createQuiz, {
    userId,
    questions,
    content,
    kind,
    format,
  });
};

export const updateUserAnswers = ({
  quizId,
  userAnswers,
  score,
}: updateUserAnswerProps) => {
  return fetchMutation(api.quizify.quiz.updateAnswers, {
    id: quizId,
    userAnswers,
    score,
  });
};

export const getPreloadedQuiz = (id: Id<"quiz">) => {
  return preloadQuery(api.quizify.quiz.getQuiz, { id });
};

export const getQuiz = (id: Id<"quiz">) => {
  return fetchQuery(api.quizify.quiz.getQuiz, { id });
};

export const getQuizHistory = (userId: Id<"users">) => {
  return fetchQuery(api.quizify.quiz.getQuizHistory, { userId });
};
