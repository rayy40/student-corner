"use node";

import {
  ChatData,
  CreateUserPrompt,
  FormatType,
  GameData,
  QuizData,
  UserAnswers,
} from "@/types";

import { MCQformat, NameTheFollowingformat, TrueFalseformat } from "./format";

import { v4 as uuidv4 } from "uuid";

import fuzzysearch from "fuzzysearch";

export const JSONFormat = (format: FormatType) => {
  const formatJSON =
    format === "mcq"
      ? MCQformat
      : format === "name"
      ? NameTheFollowingformat
      : TrueFalseformat;
  return formatJSON;
};

export const createSystemPrompt = (format: FormatType) => {
  let prompt = `I want you to act as a Quiz generator. Your task is to generate a quiz and format the response in JSON for structure as provided with an example: ${JSON.stringify(
    JSONFormat(format)
  )}.`;
  return prompt;
};

export const createUserPrompt = ({
  format,
  questionNumber,
  content,
  kind,
}: CreateUserPrompt) => {
  let prompt = `Generate ${questionNumber} ${format} type questions, and provide a suitable title for the quiz (It should not include the word Quiz),`;

  if (kind === "topic") {
    prompt += ` related to ${content}`;
  } else {
    prompt += ` related to the below text:\n\nText:\n------\n${content}\n------`;
  }

  if (format === "mcq") {
    prompt += ` with three incorrect options and only one correct option`;
  } else if (format === "name") {
    prompt += ` with answers being maximum of 3 words`;
  }

  return prompt;
};

export const numToAlpha = (num: number) => {
  if (num < 1 || num > 26) {
    return "Invalid input. Number must be between 1 and 26.";
  }

  const base = "A".charCodeAt(0) - 1;

  return String.fromCharCode(base + num);
};

export const calculateScore = (
  quizData: QuizData[],
  userAnswers: UserAnswers
) => {
  let correctAnswers = 0;
  let score = 0;

  quizData.forEach((question, index) => {
    const userAnswer = userAnswers[index + 1];
    const isCorrect = fuzzysearch(userAnswer, question.answer);

    if (isCorrect) {
      correctAnswers++;
      score += 1;
    }
  });

  const totalScore = (score / quizData.length) * 100;

  return {
    score: Math.round(totalScore),
    correctAnswer: correctAnswers,
  };
};

export const isValidQuizId = (quizId: string): boolean => {
  return !!quizId && /^[a-z0-9]{32}$/.test(quizId);
};

export const generateRandomString = () => {
  const uuid = uuidv4();
  const randomString = uuid.slice(0, 6);
  return randomString;
};

export const getDate = (timestamp: number) => {
  const date = new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return date;
};

export const isGameData = (item: ChatData | GameData): item is GameData => {
  return (item as GameData).content !== undefined;
};
