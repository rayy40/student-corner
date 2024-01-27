"use client";

import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated/UnAuthenticated";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { chatSchema } from "@/schema/chat_schema";
import { z } from "zod";
import DropDown from "@/components/DropDown/DropDown";
import Document from "@/components/Upload/Documents/Documents";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserIdStore } from "@/providers/store";
import { useRouter } from "next/navigation";

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
  const { isLoaded, isSignedIn } = useAuth();
  const { userId } = useUserIdStore();
  const router = useRouter();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createChatbook = useMutation(api.chatbook.createChatbook);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingError, setIsUploadingError] = useState(false);

  const by = watch("by", "document");

  useEffect(() => {
    if (by === "link") {
      trigger("link");
    } else if (by === "document") {
      trigger("document");
    }
  }, [by, trigger]);

  const onSubmit = async (data: FieldValues) => {
    setIsUploading(true);
    console.log(data);
    try {
      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": data?.document?.[0]!.type },
        body: data?.document?.[0],
      });

      const { storageId } = await result.json();

      const chatId = await createChatbook({
        userId: userId as Id<"users">,
        storageId: storageId,
      });
      console.log(chatId);
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.log(err);
      setIsUploading(false);
      setIsUploadingError(true);
    } finally {
      reset();
    }
  };

  if (!isLoaded && isSignedIn !== true) {
    return (
      <div className="flex items-center justify-center w-full h-full">
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
              value={"Document"}
              lists={["document", "link"]}
              setValue={setValue}
            />
          </div>
          {by === "document" && (
            <Document
              isSubmitted={isSubmitted}
              errors={errors}
              register={register}
              kind="chat"
              format="document"
            />
          )}
          <button
            className="p-2 mt-2 font-semibold transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary-hover"
            type="submit"
          >
            Submit
          </button>
          {isUploadingError && (
            <p className="text-center text-error">Unable to upload file.</p>
          )}
        </form>
      )}
    </div>
  );
};

export default Chat;
