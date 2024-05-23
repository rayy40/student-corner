"use client";

import {
  codebaseSchema,
  documentationSchema,
  youtubeSchema,
  filesSchema as chatFilesSchema,
} from "@/schema/chat_schema";
import {
  filesSchema as quizFilesSchema,
  paragraphSchema,
  topicSchema,
} from "@/schema/quiz_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { useForm, FormProvider } from "react-hook-form";

type Props = {
  children: ReactNode;
};

export function TopicProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(topicSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function ParagraphProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(paragraphSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function DocumentProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(quizFilesSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function YoutubeProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(youtubeSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function GithubProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(codebaseSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function DocsProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(documentationSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function FilesProvider({ children }: Props) {
  const methods = useForm({
    resolver: zodResolver(chatFilesSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
