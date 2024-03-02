"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FieldError, FieldValues } from "react-hook-form";

import DropDown from "@/components/DropDown";
import LoadingSpinner from "@/components/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated";
import Document from "@/components/Upload/Documents/Documents";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useFormWithDynamicSchema from "@/hooks/useFormWithDynamicSchema";
import { useUserIdStore } from "@/providers/user-store";
import { ChatSchemaSelection } from "@/types";

const Chat = () => {
  const [formSchema, setFormSchema] = useState<ChatSchemaSelection>("youtube");

  const {
    register,
    handleSubmit,
    errors,
    isSubmitted,
    reset,
    watch,
    setValue,
  } = useFormWithDynamicSchema({ kind: "chat", selectedSchema: formSchema });
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { userId } = useUserIdStore();
  const router = useRouter();

  const generateUploadUrl = useMutation(api.helper.utils.generateUploadUrl);
  const createChatbook = useMutation(api.chatbook.index.createChatbook);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const repo = watch("repo", "public");

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
    try {
      setIsUploading(true);
      let chatId;
      if (formSchema === "files") {
        const storageId = await uploadDocument(data.files[0]);
        chatId = await createChatbook({
          userId: userId as Id<"users">,
          storageId,
          type: data.by,
        });
      } else {
        chatId = await createChatbook({
          userId: userId as Id<"users">,
          url: data?.[formSchema],
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
        [data.by]: data.by === "files" ? null : "",
      });
    }
  };

  const Docs = () => {
    return (
      <div className="flex flex-col gap-1">
        <label
          className="font-semibold text-label capitalize"
          htmlFor="Documentation"
        >
          Docs Url
        </label>
        <input
          type="url"
          className="w-full p-2 border border-gray-200 rounded-md bg-input shadow-input"
          placeholder="Paste your link."
          id="Documentation"
          {...register("documentation")}
        />
        {isSubmitted && (
          <p className="mt-2 text-center text-error">
            {(errors as { documentation?: FieldError }).documentation?.message}
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
        {isSubmitted && (
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
        {isSubmitted && (
          <p className="mt-2 text-center text-error">
            {(errors as { codebase?: FieldError }).codebase?.message}
          </p>
        )}
      </div>
    );
  };

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
              value={formSchema}
              lists={["youtube", "codebase", "documentation", "files"]}
              setError={setError}
              setValue={setValue}
              setFormSchema={setFormSchema}
            />
          </div>
          {formSchema === "files" && (
            <Document
              kind="chat"
              format="files"
              errors={errors}
              register={register}
              isSubmitted={isSubmitted}
            />
          )}
          {formSchema === "documentation" && <Docs />}
          {formSchema === "codebase" && <Github />}
          {formSchema === "youtube" && <Youtube />}
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
