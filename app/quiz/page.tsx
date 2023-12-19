"use client";

import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import DropDown from "@/components/DropDown/DropDown";
import { quizSchema } from "@/schema/quiz_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

type quizSchema = z.infer<typeof quizSchema>;

const Quiz = () => {
  const {
    watch,
    trigger,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<quizSchema>({
    resolver: zodResolver(quizSchema),
  });

  const format = watch("format", "mcq");
  const by = watch("by", "topic");

  useEffect(() => {
    if (by === "topic") {
      trigger("topic");
    } else if (by === "paragraph") {
      trigger("paragraph");
    }
  }, [by, trigger]);

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };

  console.log(errors);

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
        {/* {errors?.topic && (
          <p className="mt-1 text-[0.95rem] text-error">
            {errors.topic?.message}
          </p>
        )} */}
      </div>
    );
  };

  const Paragraph = () => {
    return (
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-[hsl(0_0%_50%)]" htmlFor="Topic">
          Paragraph
        </label>
        <textarea
          className="p-2 border rounded-md border-border shadow-input bg-secondary"
          rows={8}
          id="Paragraph"
          placeholder="Enter text"
          {...register("paragraph")}
        />
        {/* {errors?.paragraph && (
          <p className="mt-1 text-[0.95rem] text-error">
            {errors?.paragraph?.message}
          </p>
        )} */}
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
        <label className="font-semibold text-[hsl(0_0%_50%)]" htmlFor="Format">
          Format
        </label>
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

  return (
    <div className="flex max-w-[500px] -my-12 mx-auto h-full items-center justify-center p-4 pt-20">
      <form
        className="flex flex-col w-full gap-8"
        action={"/"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-4xl font-semibold">Quizify</h1>
          <DropDown
            value={"Topic"}
            lists={["topic", "paragraph"]}
            setValue={setValue}
          />
        </div>
        {by === "topic" && <Topic />}
        {by === "paragraph" && <Paragraph />}
        <Questions />
        <Format />
        <button
          className="p-2 mt-6 font-semibold transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary-hover"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Quiz;
