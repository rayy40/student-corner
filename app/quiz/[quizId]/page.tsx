"use client";

import { useMutation, useQuery } from "convex/react";
import { Infer } from "convex/values";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LuTimer } from "react-icons/lu";
import { z } from "zod";

import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated/UnAuthenticated";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Response } from "@/convex/schema";
import { calculateScore, numToAlpha } from "@/helpers/utils";
import { answerSchema } from "@/schema/quiz_schema";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";

type answerSchema = z.infer<typeof answerSchema>;
type QuizData = Infer<typeof Response>;

const QuizId = ({ params }: { params: { quizId: string } }) => {
  const { register, handleSubmit, setValue, getValues } = useForm({
    resolver: zodResolver(answerSchema),
  });
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: string;
  }>({});
  const { isLoaded, isSignedIn } = useAuth();

  const quizData = useQuery(api.quiz.getQuizData, {
    quizId: params.quizId,
  });

  const patchAnswer = useMutation(api.quiz.patchAnswer);

  const onSubmit = async () => {
    const values = getValues();
    const score = calculateScore(
      quizData?.quiz?.response as QuizData[],
      selectedOptions
    );
    console.log(score);
    const updatedResponse = (quizData?.quiz?.response as QuizData[]).map(
      (item, index) => ({
        ...item,
        yourAnswer: selectedOptions[index + 1],
      })
    );

    console.log(updatedResponse);
    try {
      await patchAnswer({
        quizId: params.quizId as Id<"quiz">,
        response: updatedResponse,
      });
    } catch (errors) {
      console.log(errors);
    }
  };

  const handleOptionStyleChange = (id: number, answer: string) => {
    if (selectedOptions[id + 1] === answer) {
      return "bg-muted text-foreground";
    } else {
      ("bg-transparent text-tertiary-foreground hover:bg-secondary-hover hover:text-secondary-foreground");
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

  if (!quizData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (quizData?.err) {
    return (
      <div className="flex items-center justify-center w-full h-full text-lg">
        <p>No Quiz Id found.</p>
      </div>
    );
  }

  if (quizData?.quiz && !quizData?.quiz?.response) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quizData?.quiz) {
    return (
      <div className="flex items-center justify-center w-full h-full text-lg">
        <p>{quizData?.fallback}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[600px] -my-12 mx-auto h-full items-center justify-center p-4 pt-20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-lg">
          <span className="font-medium text-muted-foreground">Topic: </span>
          <p>{quizData?.quiz?.content}</p>
        </div>
        <div className="flex gap-0.5 font-semibold item-center text-muted-foreground">
          <LuTimer size="1.5rem" /> 19s
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        action="/"
        className="flex flex-col w-full gap-6"
      >
        {quizData?.quiz?.response ? (
          Array.isArray(quizData?.quiz?.response) ? (
            quizData?.quiz?.response?.map((item, id) => (
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
                      {quizData?.quiz?.response?.length}
                    </span>
                  </span>
                  <p>{item.question}</p>
                </div>
                {quizData?.quiz?.format === "mcq" && (
                  <MCQFormatQuiz item={item} id={id} />
                )}
                {quizData?.quiz?.format === "name" && (
                  <NameFormatQuiz id={id} />
                )}
                {quizData?.quiz?.format === "true_false" && (
                  <TrueFalseQuiz id={id} />
                )}
              </div>
            ))
          ) : (
            <p>{quizData?.quiz?.response}</p>
          )
        ) : (
          <p>Unavailable</p>
        )}
        <div className="flex items-center justify-between w-full pt-4">
          <button
            type="button"
            disabled={questionNumber === 1 ? true : false}
            className="p-2 px-3 border rounded-md disabled:opacity-40 bg-muted enabled:hover:bg-muted-hover shadow-button border-border"
            onClick={() => setQuestionNumber((prev) => prev - 1)}
          >
            Previous
          </button>
          {questionNumber === quizData?.quiz?.response?.length ? (
            <button
              className="p-2 px-3 font-semibold transition-colors border rounded-md shadow-button border-border bg-primary hover:bg-primary-hover text-primary-foreground"
              type="submit"
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
