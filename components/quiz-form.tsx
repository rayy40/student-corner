"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { FieldError, useFormContext } from "react-hook-form";

import { formats } from "@/helpers/constants";
import { cn } from "@/helpers/utils";

import { FormError } from "./ui/form-error";
import { Input, TextArea } from "./ui/input";

export const Topic = () => {
  const {
    register,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-[hsl(0_0%_50%)]" htmlFor="Topic">
        Topic
      </label>
      <Input
        isDisabled={isSubmitting}
        itemType="text"
        defaultValue=""
        id="Topic"
        placeholder="Enter topic"
        {...register("topic")}
      />
      {!isValid && (
        <FormError error={(errors as { topic?: FieldError }).topic} />
      )}
    </div>
  );
};

export const Paragrah = () => {
  const {
    register,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-[hsl(0_0%_50%)]" htmlFor="Paragraph">
        Paragraph
      </label>
      <TextArea
        isDisabled={isSubmitting}
        rows={8}
        id="Paragraph"
        placeholder="Enter text"
        {...register("paragraph")}
      />
      {!isValid && (
        <FormError error={(errors as { paragraph?: FieldError }).paragraph} />
      )}
    </div>
  );
};

export const Questions = () => {
  const {
    register,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-[hsl(0_0%_50%)]" htmlFor="Questions">
        Questions
      </label>
      <Input
        isDisabled={isSubmitting}
        itemType="number"
        defaultValue={5}
        id="Questions"
        placeholder="Enter questions"
        {...register("questions", {
          valueAsNumber: true,
        })}
      />
      {!isValid && (
        <FormError error={(errors as { questions?: FieldError }).questions} />
      )}
    </div>
  );
};

export const Format = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const format = searchParams.get("format") || "true/false";

  const {
    setValue,
    formState: { isSubmitting },
  } = useFormContext();

  const handleFormat = (currentValue: string) => {
    // const current = new URLSearchParams(searchParams);
    // current.set("format", currentValue.toLowerCase().trim());

    setValue("format", currentValue.toLowerCase().trim());

    // router.push(pathname + "?" + current.toString());
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-[hsl(0_0%_50%)]">Format</div>
      <div className="flex items-center w-full border rounded-md border-border">
        {formats.map((item) => (
          <button
            disabled={isSubmitting}
            key={item}
            onClick={() => handleFormat(item)}
            className={cn(
              "p-2 capitalize transition-colors text-secondary-foreground first:rounded-l-md last:rounded-r-md hover:bg-secondary-hover shadow-light border-r border-border grow bg-secondary",
              {
                "bg-secondary-hover": item === format.toLowerCase().trim(),
              }
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};
