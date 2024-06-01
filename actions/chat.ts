"use server";

import { redirect } from "next/navigation";
import { FieldValues } from "react-hook-form";

import { Id } from "@/convex/_generated/dataModel";
import { createChat } from "@/db/chat";
import {
  documentationSchema,
  githubSchema,
  youtubeSchema,
} from "@/schema/chat_schema";
import { generateUploadUrl, getFile } from "@/db/utils";

export const youtube = async (values: FieldValues, userId?: string) => {
  const validatedFields = youtubeSchema.safeParse(values);

  if (!userId) {
    return { error: "You need to login." };
  }

  if (!validatedFields.success) {
    return { error: "Invdalid fields" };
  }

  const { youtube } = validatedFields.data;

  const id = await createChat({
    userId: userId as Id<"users">,
    url: youtube,
    type: "youtube",
  });

  if (!id) {
    return { error: "Unable to generate chat, please try again." };
  }

  redirect(`/chat/youtube/${id}`);
};

export const github = async (values: FieldValues, userId?: string) => {
  const validatedFields = githubSchema.safeParse(values);

  if (!userId) {
    return { error: "You need to login." };
  }

  if (!validatedFields.success) {
    return { error: "Invdalid fields" };
  }

  const { github } = validatedFields.data;

  const id = await createChat({
    userId: userId as Id<"users">,
    url: github,
    type: "github",
  });

  if (!id) {
    return { error: "Unable to generate chat, please try again." };
  }

  redirect(`/chat/github/${id}`);
};

export const documentation = async (values: FieldValues, userId?: string) => {
  const validatedFields = documentationSchema.safeParse(values);

  if (!userId) {
    return { error: "You need to login." };
  }

  if (!validatedFields.success) {
    return { error: "Invdalid fields" };
  }

  const { documentation } = validatedFields.data;

  const { origin } = new URL(documentation);

  const id = await createChat({
    userId: userId as Id<"users">,
    domain: origin,
    url: documentation,
    type: "documentation",
  });

  if (!id) {
    return { error: "Unable to generate chat, please try again." };
  }

  redirect(`/chat/docs/${id}`);
};

export const files = async (values: FormData, userId?: string) => {
  const files = values.get("files");

  if (!userId) {
    return { error: "You need to login." };
  }

  if (!files) {
    return { error: "No files uploaded." };
  }

  const uploadUrl = await generateUploadUrl();

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: files,
  });

  if (!response.ok) {
    return { error: "Something went wrong while uploading the file." };
  }

  const { storageId } = await response.json();

  const url = await getFile(storageId);

  if (!url) {
    return { error: "No file found." };
  }

  const id = await createChat({
    userId: userId as Id<"users">,
    url,
    type: "files",
  });

  if (!id) {
    return { error: "Unable to generate chat, please try again." };
  }

  redirect(`/chat/files/${id}`);
};
