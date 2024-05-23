"use client";
import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { FieldValues, useFormContext } from "react-hook-form";

import { paragraph, topic } from "@/actions/quiz";
import { FormType } from "@/types";

import DropDown from "./DropDown";
import { FormError } from "./ui/form-error";
import { SubmitButton } from "./ui/button";

const Form = <K extends "chat" | "quiz">({
  kind,
  title,
  schema,
  types,
  children,
}: FormType<K>) => {
  const { handleSubmit } = useFormContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, startTransition] = useTransition();

  const { status, data } = useSession();

  if (status === "unauthenticated") {
    //TOOD: handle unauthentication
    return;
  }

  const onSubmit = (formData: FieldValues) => {
    if (kind === "quiz") {
      switch (schema) {
        case "topic":
          startTransition(() => {
            topic(formData, data?.user?.id).then((data) => {
              setError(data?.error);
            });
          });
          return;
        case "paragraph":
          startTransition(() => {
            paragraph(formData, data?.user?.id).then((data) => {
              setError(data?.error);
            });
          });
          return;
        default:
          return null;
      }
    }
  };

  return (
    <form
      className="flex flex-col w-full gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-sans text-4xl font-semibold">{title}</h1>
        <DropDown kind={kind} value={schema} lists={types} />
      </div>
      {children}
      <SubmitButton isDisabled={isSubmitting}>Submit</SubmitButton>
      <FormError error={error} />
    </form>
  );
};

export default Form;
