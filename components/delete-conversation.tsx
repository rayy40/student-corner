"use client";
import { useMutation } from "convex/react";
import { LuTrash } from "react-icons/lu";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const DeleteConversation = ({ chatId }: { chatId: Id<"chatbook"> }) => {
  const deleteConversation = useMutation(
    api.chatbook.conversations.deleteConversation
  );

  const handleDelete = async () => {
    await deleteConversation({ chatId });
    window.location.reload();
  };

  return (
    <LuTrash
      onClick={handleDelete}
      className="text-lg cursor-pointer opacity-60 hover:opacity-100"
    />
  );
};

export default DeleteConversation;
