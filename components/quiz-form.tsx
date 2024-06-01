"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { FieldError, useFormContext } from "react-hook-form";

import { formats } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { FormError } from "./ui/form-error";
import { Input, TextArea } from "./ui/input";
import { Label } from "./ui/label";

export const Topic = () => {
  const {
    register,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <Label label="topic" />
      <Input
        className="border-gray-200 bg-input shadow-input"
        isDisabled={isSubmitting}
        itemType="text"
        defaultValue=""
        id="Topic"
        placeholder="Enter topic"
        {...register("topic")}
      />
      {!isValid && (
        <FormError
          className="p-[10px] mt-3"
          error={(errors as { topic?: FieldError }).topic}
        />
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
      <Label label="paragraph" />
      <TextArea
        isDisabled={isSubmitting}
        rows={8}
        id="Paragraph"
        placeholder="Enter text"
        {...register("paragraph")}
      />
      {!isValid && (
        <FormError
          className="p-[10px] mt-3"
          error={(errors as { paragraph?: FieldError }).paragraph}
        />
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
      <Label label="questions" />
      <Input
        className="border-gray-200 bg-input shadow-input"
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
        <FormError
          className="p-[10px] mt-3"
          error={(errors as { questions?: FieldError }).questions}
        />
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
      <div className="font-semibold text-sm md:text-[1rem] text-label">
        Format
      </div>
      <div className="flex items-center w-full border rounded-md border-border">
        {formats.map((item) => (
          <button
            disabled={isSubmitting}
            key={item}
            onClick={() => handleFormat(item)}
            className={cn(
              "p-[10px] capitalize transition-colors text-secondary-foreground first:rounded-l-md last:rounded-r-md hover:bg-secondary-hover shadow-light border-r border-border grow bg-secondary",
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
