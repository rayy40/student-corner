"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldError, FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import DropDown from "@/components/DropDown";
import LoadingSpinner from "@/components/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated";
import Document from "@/components/Upload/Documents/Documents";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserIdStore } from "@/providers/store";
import { quizSchema } from "@/schema/quiz_schema";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";

type quizSchema = z.infer<typeof quizSchema>;

const Quiz = () => {
  const {
    reset,
    watch,
    trigger,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<quizSchema>({
    resolver: zodResolver(quizSchema),
    mode: "onBlur",
  });

  const { isLoaded, isSignedIn } = useAuth();
  const { userId } = useUserIdStore();

  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [error, setError] = useState("");

  const createQuiz = useMutation(api.quiz.createQuiz);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const router = useRouter();
  const format = watch("format", "mcq");
  const by = watch("by", "topic");

  const onSubmit = async (data: FieldValues) => {
    setIsCreatingQuiz(true);
    let content = "",
      storage = "";
    if (by === "topic") {
      content = "topic";
    } else if (by === "paragraph") {
      content = "paragraph";
    } else if (by === "document") {
      content = "document";
    }
    console.log(data);
    try {
      if (content === "document") {
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl as string, {
          method: "POST",
          headers: { "Content-Type": data?.document?.[0]!.type },
          body: data?.document?.[0],
        });

        const { storageId } = await result.json();
        storage = storageId;
      }
      const quizId = await createQuiz({
        userId: userId as Id<"users">,
        questionNumber: data.questions,
        content: content === "document" ? storage : data?.[content],
        format: data.format,
        kind: data.by,
      });
      router.push(`/quiz/${quizId}`);
    } catch (error) {
      setError((error as Error).message);
      setIsCreatingQuiz(false);
      setValue("by", data.by);
    } finally {
      reset({
        by: data.by,
        format: "mcq",
        questions: 5,
        [data.by]: data.by === "document" ? null : "",
      });
    }
  };

  const Topic = () => {
    return (
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-[hsl(0_0%_50%)]" htmlFor="Topic">
          Topic
        </label>
        <input
          className="p-2 border rounded-md border-border shadow-input bg-secondary"
          type="text"
          id="Topic"
          placeholder="Enter topic"
          {...register("topic")}
        />
        {isSubmitted && by === "topic" && (
          <p className="mt-1 text-[0.95rem] text-error">
            {(errors as { topic?: FieldError }).topic?.message}
          </p>
        )}
      </div>
    );
  };

  const Paragraph = () => {
    return (
      <div className="flex flex-col gap-1">
        <label
          className="font-semibold text-[hsl(0_0%_50%)]"
          htmlFor="Paragraph"
        >
          Paragraph
        </label>
        <textarea
          className="p-2 border rounded-md border-border shadow-input bg-secondary"
          rows={8}
          id="Paragraph"
          placeholder="Enter text"
          {...register("paragraph")}
        />
        {isSubmitted && by === "paragraph" && (
          <p className="mt-1 text-[0.95rem] text-error">
            {(errors as { paragraph?: FieldError }).paragraph?.message}
          </p>
        )}
      </div>
    );
  };

  const Questions = () => {
    return (
      <div className="flex flex-col gap-1">
        <label
          className="font-semibold text-[hsl(0_0%_50%)]"
          htmlFor="Questions"
        >
          Questions
        </label>
        <input
          className="p-2 border rounded-md border-border shadow-input bg-secondary"
          type="number"
          defaultValue={5}
          id="Questions"
          placeholder="Enter questions"
          {...register("questions", {
            valueAsNumber: true,
            onBlur: () => trigger("questions"),
          })}
        />
        {errors.questions && (
          <p className="mt-1 text-[0.95rem] text-error">
            {errors.questions?.message}
          </p>
        )}
      </div>
    );
  };

  const Format = () => {
    return (
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-[hsl(0_0%_50%)]">Format</div>
        <div className="flex items-center w-full border rounded-md border-border">
          <button
            onClick={() => {
              setValue("format", "mcq");
            }}
            className={`p-2 transition-colors text-secondary-foreground rounded-l-md ${
              format === "mcq" ? "bg-secondary-hover" : "bg-secondary"
            } hover:bg-secondary-hover shadow-input grow`}
          >
            MCQ
          </button>
          <button
            onClick={() => {
              setValue("format", "name");
            }}
            className={`p-2 transition-colors text-secondary-foreground border-x ${
              format === "name" ? "bg-secondary-hover" : "bg-secondary"
            } hover:bg-secondary-hover shadow-input grow`}
          >
            Name the following
          </button>
          <button
            onClick={() => {
              setValue("format", "true_false");
            }}
            className={`p-2 transition-colors text-secondary-foreground rounded-r-md ${
              format === "true_false" ? "bg-secondary-hover" : "bg-secondary"
            } hover:bg-secondary-hover shadow-input grow`}
          >
            True/False
          </button>
        </div>
      </div>
    );
  };

  if (!isLoaded && isSignedIn !== true) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <UnAuthenticated />;
  }

  return (
    <div className="flex font-sans max-w-[500px] -my-12 mx-auto h-screen items-center justify-center p-4 pt-20">
      {isCreatingQuiz ? (
        <LoadingSpinner />
      ) : (
        <form
          className="flex flex-col w-full gap-8"
          action={"/"}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-4xl font-semibold font-dmSans">Quizify</h1>
            <DropDown
              kind="quiz"
              reset={reset}
              trigger={trigger}
              value={by}
              lists={["topic", "paragraph", "document"]}
              setValue={setValue}
              setError={setError}
            />
          </div>
          {by === "topic" && <Topic />}
          {by === "paragraph" && <Paragraph />}
          {by === "document" && (
            <Document
              isSubmitted={isSubmitted}
              errors={errors}
              register={register}
              kind="quiz"
              format="document"
            />
          )}
          <Questions />
          <Format />
          <button
            className="p-2 mt-6 font-semibold transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary-hover"
            type="submit"
          >
            Submit
          </button>
          {error && <p className="text-center text-error">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default Quiz;
