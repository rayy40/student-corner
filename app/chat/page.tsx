"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import DropDown from "@/components/DropDown";
import LoadingSpinner from "@/components/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated";
import Document from "@/components/Upload/Documents/Documents";
import Url from "@/components/Upload/Link/Url";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserIdStore } from "@/providers/store";
import { chatSchema } from "@/schema/chat_schema";
import { useAuth } from "@clerk/clerk-react";
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
    formState: { errors: formErrors, isSubmitted },
  } = useForm<chatSchema>({
    resolver: zodResolver(chatSchema),
    mode: "onBlur",
  });
  const { isLoaded, isSignedIn } = useAuth();
  const { userId } = useUserIdStore();
  const router = useRouter();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createChatbook = useMutation(api.chatbook.createChatbook);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const repo = watch("repo", "public");
  const by = watch("by", "document");

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
      if (by === "document") {
        const storageId = await uploadDocument(data.document[0]);
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

  if (!isLoaded && isSignedIn !== true) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSignedIn) {
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
            <h1 className="text-4xl font-semibold font-dmSans">Chatbook</h1>
            <DropDown
              kind="chat"
              reset={reset}
              value={by}
              trigger={trigger}
              lists={["document", "youtube", "github"]}
              setError={setError}
              setValue={setValue}
            />
          </div>
          {by === "document" && (
            <Document
              kind="chat"
              format="document"
              errors={formErrors}
              register={register}
              isSubmitted={isSubmitted}
            />
          )}
          {["youtube", "github"].includes(by) && (
            <Url
              kind="chat"
              repo={repo}
              format={by}
              errors={formErrors}
              register={register}
              setValue={setValue}
              isSubmitted={isSubmitted}
            />
          )}
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
