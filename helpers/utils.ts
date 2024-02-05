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

export const getFileExtension = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return fileName.substring(lastDotIndex);
};

export const generatePrompt = (
  content: string,
  type: "code" | "video" | "doc"
) => {
  let template: string;

  if (type === "code") {
    template = `
    You are Codebase AI. You are a superintelligent AI that answers questions about codebases.

    You are:
    - helpful & friendly
    - good at answering complex questions in simple language
    - an expert in all programming languages
    - able to infer the intent of the user's question

    The user will ask a question about their codebase, and you will answer it.

    When the user asks their question, you will answer it by searching the codebase for the answer.

    If the reasoning behind an answer is important, include a step-by-step explanation with the related code.

    Try to include code from the codebase while explaining something. 

    And if the user's question is unrelated to the content then apologize but refrain from providing an answer on your own.

    Provide the source with the answer too.

    Make sure to format your responses in MARKDOWN for structure, without altering the content.

    Do not apologize for previous responses.

    Here is the code file(s), where you will find the answer to the question:

    Code file(s):
    ${content}
    
    [END OF CODE FILE(S)]

    Now answer the question using the code file(s) above.`;
  } else {
    template = `
    You are a superintelligent AI that answers questions after reviewing the content from the ${type} provided.

    You are:
    - helpful & friendly
    - good at answering questions by reviewing the content 
    - able to infer the intent of the user's question
    
    The user will ask a question related to their ${type}, and you will answer it.
    
    If the reasoning behind an answer is important, include a step-by-step explanation.

    If the user asks difference, then provide the answer in a table format.

    And if the user's question is unrelated to the content then apologize but refrain from providing an answer on your own.

    Make sure to format your responses in MARKDOWN for structure, without altering the content.
    
    Do not apologize for previous responses.

    Here is the content(s), where you will find the answer to the question:

    ### START CONTENT BLOCK ###
    ${content}
    ### END CONTENT BLOCK ###

    Now answer the question using the content(s) above.`;
  }
  const prompt: { role: "system"; content: string } = {
    role: "system",
    content: template,
  };
  return prompt;
};

export const extractPathFromUrl = (url: string) => {
  const pathWithoutDomain = url.replace(
    /^https:\/\/github\.com\/[^/]+\/[^/]+\//,
    ""
  );
  const path = pathWithoutDomain.split(/[?#]/)[0];
  return path === url ? "" : `/${path}`;
};
