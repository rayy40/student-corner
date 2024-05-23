"use client";

import { useState, useTransition } from "react";

import { updateAnswers } from "@/actions/quiz";
import {
  MCQOrTrueFalseFormat,
  NameTheFollowingFormat,
} from "@/components/game-format";
import { QuizFormat, QuizGameQuestionProps } from "@/lib/types";

import { NextPrevButton } from "./ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Props = {
  format?: QuizFormat;
  userId?: string;
  quizId: Id<"quiz">;
  preloadedQuestions: Preloaded<typeof api.quizify.quiz.getQuiz>;
};

export const QuizGameForm = ({
  userId,
  quizId,
  format,
  preloadedQuestions,
}: Props) => {
  const {
    success,
    error: convexError,
    loading,
  } = usePreloadedQuery(preloadedQuestions);

  const [questionNumber, setQuestionNumber] = useState(0);
  const [isSubmitting, startTransition] = useTransition();
  const [question] = useState(success?.response?.questions);
  const [error, setError] = useState<string | undefined>(convexError);
  const [userAnswers, setUserAnswers] = useState<
    QuizGameQuestionProps[] | undefined
  >(success?.response?.questions);

  const onSubmit = () => {
    if (!userAnswers || !userId) return;
    setError(undefined);
    // TODO: handle when user answers is empty
    startTransition(() => {
      updateAnswers(userAnswers, quizId, userId).then((data) => {
        setError(data?.error);
      });
    });
  };

  const updateQuestionNumber = (operation: "prev" | "next") => {
    operation === "prev"
      ? setQuestionNumber((prev) => prev - 1)
      : setQuestionNumber((prev) => prev + 1);
  };

  if (loading) {
    // TODO: add loading
    return <div>Loading...</div>;
  }

  if (!question) {
    throw new Error("No quiz found.");
  }

  if (error) {
    throw new Error(error);
  }

  return (
    <form className="flex flex-col w-full gap-6">
      <div className="flex flex-col gap-5 text-lg">
        <div className="flex items-center gap-2">
          <span className="w-[50px] font-semibold whitespace-nowrap text-muted-foreground">
            {questionNumber + 1} /{" "}
            <span className="text-secondary-foreground">{question.length}</span>
          </span>
          <p>{question[questionNumber].question}</p>
        </div>
      </div>
      {format === "name the following" ? (
        <NameTheFollowingFormat
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          questionNumber={questionNumber}
        />
      ) : (
        <MCQOrTrueFalseFormat
          questionNumber={questionNumber}
          item={question[questionNumber]}
          setUserAnswers={setUserAnswers}
        />
      )}
      <div className="flex items-center justify-between w-full pt-4">
        <NextPrevButton
          onClick={() => updateQuestionNumber("prev")}
          isDisabled={questionNumber === 0}
        >
          Previous
        </NextPrevButton>
        {questionNumber === question.length - 1 ? (
          <NextPrevButton
            isDisabled={isSubmitting}
            className="font-semibold bg-primary enabled:hover:bg-primary-hover text-primary-foreground"
            onClick={onSubmit}
          >
            Submit
          </NextPrevButton>
        ) : (
          <NextPrevButton
            onClick={() => updateQuestionNumber("next")}
            isDisabled={questionNumber === question.length - 1}
          >
            Next
          </NextPrevButton>
        )}
      </div>
    </form>
  );
};
