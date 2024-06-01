import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";

export const generateUploadUrl = () => {
  return fetchMutation(api.lib.files.generateUploadUrl);
};

export const getFile = (storageId: Id<"_storage">) => {
  return fetchQuery(api.lib.files.getFile, {
    storageId,
  });
};
