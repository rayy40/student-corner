"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FieldError, FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import DropDown from "@/components/DropDown";
import LoadingSpinner from "@/components/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated";
import Document from "@/components/Upload/Documents/Documents";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserIdStore } from "@/providers/user-store";
import { chatSchema } from "@/schema/chat_schema";
import { zodResolver } from "@hookform/resolvers/zod";

type chatSchema = z.infer<typeof chatSchema>;

const Chat = () => {
  const {
    reset,
    watch,
    trigger,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<chatSchema>({
    resolver: zodResolver(chatSchema),
    mode: "onBlur",
  });
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { userId } = useUserIdStore();
  const router = useRouter();

  const generateUploadUrl = useMutation(api.helper.utils.generateUploadUrl);
  const createChatbook = useMutation(api.chatbook.index.createChatbook);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const repo = watch("repo", "public");
  const by = watch("by", "youtube");

  const uploadDocument = async (document: File) => {
    const uploadUrl = await generateUploadUrl();

    const response = await fetch(uploadUrl as string, {
      method: "POST",
      headers: { "Content-Type": document.type },
      body: document,
    });
    const { storageId } = await response.json();
    return storageId;
  };

  const onSubmit = async (data: FieldValues) => {
    console.log(data);
    try {
      setIsUploading(true);
      let chatId;
      if (by === "files") {
        const storageId = await uploadDocument(data.files[0]);
        chatId = await createChatbook({
          userId: userId as Id<"users">,
          storageId,
          type: data.by,
        });
      } else {
        chatId = await createChatbook({
          userId: userId as Id<"users">,
          url: data?.[by],
          type: data.by,
        });
      }
      router.push(`/chat/${chatId}`);
    } catch (error) {
      setError((error as Error).message);
      setIsUploading(false);
      setValue("by", data.by);
    } finally {
      reset({
        by: data.by,
        repo: "public",
        [data.by]: data.by === "document" ? null : "",
      });
    }
  };

  const Docs = () => {
    return (
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-label capitalize" htmlFor="Docs">
          Docs Url
        </label>
        <input
          type="url"
          className="w-full p-2 border border-gray-200 rounded-md bg-input shadow-input"
          placeholder="Paste your link."
          id="Docs"
          {...register("files")}
        />
        {isSubmitted && by === "files" && (
          <p className="mt-2 text-center text-error">
            {(errors as { files?: FieldError }).files?.message}
          </p>
        )}
      </div>
    );
  };

  const Youtube = () => {
    return (
      <div className="flex flex-col gap-1">
        <label
          className="font-semibold text-label capitalize"
          htmlFor="Youtube"
        >
          Youtube Url
        </label>
        <input
          type="url"
          className="w-full p-2 border border-gray-200 rounded-md bg-input shadow-input"
          placeholder="Paste your link."
          id="Youtube"
          {...register("youtube")}
        />
        {isSubmitted && by === "youtube" && (
          <p className="mt-2 text-center text-error">
            {(errors as { youtube?: FieldError }).youtube?.message}
          </p>
        )}
      </div>
    );
  };

  const Github = () => {
    return (
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-label capitalize" htmlFor="Github">
          Github Url
        </label>
        <input
          type="url"
          className="w-full p-2 border border-gray-200 rounded-md bg-input shadow-input"
          placeholder="Paste your link."
          id="Github"
          {...register("codebase")}
        />
        <div className="mt-4 flex flex-col gap-1">
          <div className="font-semibold text-label">Repository</div>
          <div className="flex items-center w-full border rounded-md border-border">
            <button
              onClick={() => setValue("repo", "public")}
              className={`p-2 transition-colors text-secondary-foreground rounded-l-md ${
                repo === "public" ? "bg-secondary-hover" : "bg-secondary"
              } hover:bg-secondary-hover shadow-input grow`}
            >
              Public
            </button>
            <button
              onClick={() => setValue("repo", "private")}
              className={`p-2 transition-colors text-secondary-foreground border-x ${
                repo === "private" ? "bg-secondary-hover" : "bg-secondary"
              } hover:bg-secondary-hover shadow-input grow`}
            >
              Private
            </button>
          </div>
        </div>
        {isSubmitted && by === "codebase" && (
          <p className="mt-2 text-center text-error">
            {(errors as { codebase?: FieldError }).codebase?.message}
          </p>
        )}
      </div>
    );
  };

  console.log(errors);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <UnAuthenticated />;
  }

  return (
    <div className="flex h-screen font-sans max-w-[500px] -my-12 mx-auto items-center justify-center p-4 pt-20">
      {isUploading ? (
        <LoadingSpinner />
      ) : (
        <form
          className="flex flex-col w-full gap-8"
          action={"/"}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-4xl font-semibold">Chatbook</h1>
            <DropDown
              kind="chat"
              reset={reset}
              trigger={trigger}
              value={by}
              lists={["youtube", "codebase", "documentation", "files"]}
              setValue={setValue}
              setError={setError}
            />
          </div>
          {by === "files" && (
            <Document
              kind="chat"
              format="files"
              errors={errors}
              register={register}
              isSubmitted={isSubmitted}
            />
          )}
          {by === "documentation" && <Docs />}
          {by === "codebase" && <Github />}
          {by === "youtube" && <Youtube />}
          <button
            className="p-2 font-semibold transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary-hover"
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

export default Chat;
