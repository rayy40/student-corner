"use client";
import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { FieldValues, useFormContext } from "react-hook-form";

import { files as quizFiles, paragraph, topic } from "@/actions/quiz";
import { FormType } from "@/lib/types";

import DropDown from "./ui/drop-down";
import { FormError } from "./ui/form-error";
import { SubmitButton } from "./ui/button";
import {
  youtube,
  files as chatFiles,
  github,
  documentation,
} from "@/actions/chat";

const Form = ({ kind, title, schema, types, children }: FormType) => {
  const { handleSubmit } = useFormContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, startTransition] = useTransition();

  const { status, data } = useSession();

  if (status === "unauthenticated") {
    //TOOD: handle unauthentication
    return;
  }

  const onSubmit = (formData: FieldValues) => {
    switch (schema) {
      case "topic":
        startTransition(async () => {
          const res = await topic(formData, data?.user?.id);
          setError(res?.error);
        });
        return;
      case "paragraph":
        startTransition(async () => {
          const res = await paragraph(formData, data?.user?.id);
          setError(res?.error);
        });
        return;
      case "files":
        const form = new FormData();
        form.append("files", formData?.files?.[0]);

        if (kind === "quiz") {
          form.append("questions", formData?.questions);
          form.append("format", formData?.format);
          startTransition(async () => {
            const res = await quizFiles(form, data?.user?.id);
            setError(res?.error);
          });
        } else {
          startTransition(async () => {
            const res = await chatFiles(form, data?.user?.id);
            setError(res?.error);
          });
        }
        return;
      case "youtube":
        startTransition(async () => {
          const res = await youtube(formData, data?.user?.id);
          setError(res?.error);
        });
        return;
      case "github":
        startTransition(async () => {
          const res = await github(formData, data?.user?.id);
          setError(res?.error);
        });
        return;
      case "documentation":
        startTransition(async () => {
          const res = await documentation(formData, data?.user?.id);
          setError(res?.error);
        });
        return;
      default:
        return null;
    }
  };

  return (
    <form
      className="flex flex-col max-w-[600px] w-full gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-sans text-4xl font-semibold">{title}</h1>
        <DropDown value={schema} lists={types} />
      </div>
      {children}
      <FormError className="p-[10px] -mb-3" error={error} />
      <SubmitButton isDisabled={isSubmitting}>Submit</SubmitButton>
    </form>
  );
};

export default Form;
