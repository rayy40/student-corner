"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LuTimer } from "react-icons/lu";
import { z } from "zod";

import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated/UnAuthenticated";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { calculateScore, numToAlpha } from "@/helpers/utils";
import { answerSchema } from "@/schema/quiz_schema";
import { QuizData, ResponseType } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";

type answerSchema = z.infer<typeof answerSchema>;

const QuizId = ({ params }: { params: { quizId: string } }) => {
  const { register, handleSubmit, setValue, getValues } = useForm({
    resolver: zodResolver(answerSchema),
  });
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: string;
  }>({});
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const game: ResponseType | undefined = useQuery(
    api.quiz.getQuizData,
    params.quizId !== null ? { quizId: params.quizId } : "skip"
  );

  const patchAnswer = useMutation(api.quiz.patchAnswer);

  const onSubmit = async () => {
    setIsCalculatingScore(true);
    const values = getValues();

    if (typeof game?.quizData?.response !== "object") return null;

    const result = calculateScore(game?.quizData?.response?.questions, values);

    const updatedgame = (game?.quizData?.response?.questions).map(
      (item, index) => ({
        ...item,
        yourAnswer: values[index + 1] as string,
      })
    );

    try {
      await patchAnswer({
        quizId: params.quizId as Id<"quiz">,
        questions: updatedgame,
        result: result,
      });
      router.push(`/quiz/${params.quizId}/result`);
    } catch (errors) {
      console.log(errors);
      setIsCalculatingScore(false);
    }
  };

  const handleOptionStyleChange = (id: number, answer: string) => {
    if (selectedOptions[id + 1] === answer) {
      return "bg-muted text-foreground";
    } else {
      return "bg-transparent text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground";
    }
  };

  const handleOptionChange = (questionNumber: number, option: string) => {
    setValue(`${questionNumber}`, option);
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [questionNumber]: option,
    }));
  };

  const MCQFormatQuiz = ({ item, id }: { item: QuizData; id: number }) => {
    return (
      <ul className="flex flex-col gap-2">
        {item.options?.map((option, idx) => (
          <li
            key={idx}
            className={`${handleOptionStyleChange(
              id,
              option
            )} flex items-center gap-8 p-2 transition-colors border rounded-md cursor-pointer border-border shadow-light`}
            onClick={() => handleOptionChange(id + 1, option)}
          >
            <span className="text-[1rem]">{numToAlpha(idx + 1)})</span> {option}
          </li>
        ))}
      </ul>
    );
  };

  const TrueFalseQuiz = ({ id }: { id: number }) => {
    return (
      <ul className="flex flex-col gap-2">
        <li
          className={`${handleOptionStyleChange(
            id,
            "True"
          )} flex items-center gap-8 p-2 transition-colors border rounded-md cursor-pointer border-border shadow-light`}
          onClick={() => handleOptionChange(id + 1, "True")}
        >
          <span className="text-[1rem]">A)</span>
          True
        </li>
        <li
          className={`${handleOptionStyleChange(
            id,
            "False"
          )} flex items-center gap-8 p-2 transition-colors border rounded-md cursor-pointer border-border shadow-light`}
          onClick={() => handleOptionChange(id + 1, "False")}
        >
          <span className="text-[1rem]">B)</span>
          False
        </li>
      </ul>
    );
  };

  const NameFormatQuiz = ({ id }: { id: number }) => {
    return (
      <div className="flex items-center gap-4">
        <p className="font-semibold text-muted-foreground">Ans: </p>
        <input
          className="w-[200px] text-center border-b-2 border-muted focus:border-2 focus:outline-none"
          id={(id + 1).toString()}
          type="text"
          {...register(`${id + 1}`)}
        />
      </div>
    );
  };

  if (isLoaded && !isSignedIn) {
    return <UnAuthenticated />;
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (game?.invalidQuizId || game?.idNotFound) {
    return (
      <div className="flex font-sans items-center justify-center w-full h-screen text-lg">
        <p>No Quiz Id found.</p>
      </div>
    );
  }

  if (game?.isGeneratingQuiz || isCalculatingScore) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (game?.fallbackData) {
    return (
      <div className="flex font-sans items-center justify-center w-full h-screen text-lg">
        <p>{game?.fallbackData?.response as string}</p>
      </div>
    );
  }

  return (
    <div className="flex font-sans flex-col gap-5 max-w-[600px] -my-12 mx-auto h-screen items-center justify-center p-4 pt-20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-lg">
          <span className="font-medium text-muted-foreground">Topic: </span>
          <p>
            {typeof game?.quizData?.response === "object" &&
              game?.quizData?.response?.title}
          </p>
        </div>
        <div className="flex gap-0.5 font-semibold item-center text-muted-foreground">
          <LuTimer size="1.5rem" /> {19}s
        </div>
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        action="/"
        className="flex flex-col w-full gap-6"
      >
        {typeof game?.quizData?.response === "object" &&
          game?.quizData?.response?.questions?.map((item, id) => (
            <div
              className={`${
                id + 1 === questionNumber ? "flex" : "hidden"
              } flex-col gap-4 text-lg`}
              key={id}
            >
              <div className="flex items-center gap-4 py-2">
                <span className="w-[50px] font-semibold whitespace-nowrap text-muted-foreground">
                  {id + 1} /{" "}
                  <span className="text-secondary-foreground">
                    {game?.quizData?.questionNumber}
                  </span>
                </span>
                <p>{item.question}</p>
              </div>
              {game?.quizData?.format === "mcq" && (
                <MCQFormatQuiz item={item} id={id} />
              )}
              {game?.quizData?.format === "name" && <NameFormatQuiz id={id} />}
              {game?.quizData?.format === "true_false" && (
                <TrueFalseQuiz id={id} />
              )}
            </div>
          ))}
        <div className="flex items-center justify-between w-full pt-4">
          <button
            type="button"
            disabled={questionNumber === 1}
            className="p-2 px-3 border rounded-md disabled:opacity-40 bg-muted enabled:hover:bg-muted-hover shadow-button border-border"
            onClick={() => setQuestionNumber((prev) => prev - 1)}
          >
            Previous
          </button>
          {questionNumber === game?.quizData?.questionNumber ? (
            <button
              className="p-2 px-3 font-semibold transition-colors border rounded-md shadow-button border-border bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={handleSubmit(onSubmit)}
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setQuestionNumber((prev) => prev + 1)}
              className="p-2 px-3 transition-colors border rounded-md shadow-button border-border bg-muted hover:bg-muted-hover text-foreground"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizId;
