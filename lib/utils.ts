import { CreateUserPrompt } from "@/lib/types";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numToChar = (num: number) => {
  if (num < 1 || num > 26) {
    return "Invalid input. Number must be between 1 and 26.";
  }

  const base = "A".charCodeAt(0) - 1;

  return String.fromCharCode(base + num);
};

export const createUserPrompt = ({
  format,
  numberOfQuestions,
  content,
  kind,
}: CreateUserPrompt) => {
  let prompt = `Generate ${numberOfQuestions} ${format} type questions, and provide a suitable title for the quiz (It should not include the word Quiz),`;

  if (kind === "topic") {
    prompt += ` related to ${content}`;
  } else {
    prompt += ` related to the below text:\n\nText:\n------\n${content}\n------`;
  }

  if (format === "mcq") {
    prompt += ` with three incorrect options and only one correct option`;
  } else if (format === "name the following") {
    prompt += ` with answers being maximum of 3 words`;
  }

  return prompt;
};

export const isValidQuizId = (quizId: string): boolean => {
  return !!quizId && /^[a-z0-9]{32}$/.test(quizId);
};

export const getDate = (timestamp: number) => {
  const date = new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return date;
};

export const getFileExtension = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return fileName.substring(lastDotIndex);
};

export const getYouTubeVideoId = (url: string) => {
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regExp);

  if (match) {
    return match[1];
  }
  return null;
};

export const isYoutubeUrl = (url: string) => {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;

  return youtubeRegex.test(url);
};

export const isDocsUrl = (url: string) => {
  const docsRegex =
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/.*docs.*$/;

  return docsRegex.test(url);
};

export const getLastNameInitials = (fullName?: string | null) => {
  if (!fullName) return "A";

  const nameParts = fullName.split(/\s+/);

  if (nameParts.length === 0) {
    return "";
  } else if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  const firstName = nameParts[0];
  const firstInitial = firstName.charAt(0).toUpperCase();

  const lastName = nameParts[nameParts.length - 1];
  const lastInitial = lastName.charAt(0).toUpperCase();

  return firstInitial + lastInitial;
};
