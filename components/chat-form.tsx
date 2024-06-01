"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { FieldError, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { useRouter } from "@/hooks/useRouter";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { FormError } from "./ui/form-error";

export const Github = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const repo = searchParams.get("repo") || "public";

  const {
    register,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext();

  const handleFormat = (currentValue: string) => {
    const current = new URLSearchParams(searchParams);
    current.set("repo", currentValue.toLowerCase().trim());

    setValue("repo", currentValue.toLowerCase().trim());

    router.push(pathname + "?" + current.toString());
  };

  const repos = ["public", "private"];

  return (
    <div className="flex flex-col gap-1">
      <Label label="github" />
      <Input
        className="border-gray-200 bg-input shadow-input"
        isDisabled={isSubmitting}
        itemType="url"
        defaultValue=""
        id="Github"
        placeholder="Paste your link"
        {...register("github")}
      />
      <div className="flex flex-col gap-1 mt-4">
        <div className="font-semibold text-label">Repository</div>
        <div className="flex items-center w-full border rounded-md border-border">
          {repos.map((item) => (
            <button
              key={item}
              onClick={() => handleFormat(item)}
              className={cn(
                "p-[10px] capitalize transition-colors text-secondary-foreground rounded-l-md hover:bg-secondary-hover shadow-input grow bg-secondary",
                {
                  "bg-secondary-hover": item === repo.toLowerCase().trim(),
                }
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {!isValid && (
        <FormError
          className="p-[10px]"
          error={(errors as { github?: FieldError }).github}
        />
      )}
    </div>
  );
};

export const Youtube = () => {
  const {
    register,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <Label label="youtube" />
      <Input
        className="border-gray-200 bg-input shadow-input"
        isDisabled={isSubmitting}
        itemType="url"
        defaultValue=""
        id="Youtube"
        placeholder="Paste your link"
        {...register("youtube")}
      />
      {!isValid && (
        <FormError
          className="p-[10px]"
          error={(errors as { youtube?: FieldError }).youtube}
        />
      )}
    </div>
  );
};

export const Docs = () => {
  const {
    register,
    formState: { isValid, errors, isSubmitting },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <Label label="documentation" />
      <Input
        className="border-gray-200 bg-input shadow-input"
        isDisabled={isSubmitting}
        itemType="url"
        defaultValue=""
        id="Documentation"
        placeholder="Paste your link"
        {...register("documentation")}
      />
      {!isValid && (
        <FormError
          className="p-[10px]"
          error={(errors as { documentation?: FieldError }).documentation}
        />
      )}
    </div>
  );
};
