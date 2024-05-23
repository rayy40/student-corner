import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CreateQuizProps, updateUserAnswerProps } from "@/lib/types";
import { fetchMutation, preloadQuery } from "convex/nextjs";

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
