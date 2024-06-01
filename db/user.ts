import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const getUserByEmail = (email: string) => {
  return fetchQuery(api.auth.users.getUserByEmail, {
    email,
  });
};

export const getUserById = (id: Id<"users">) => {
  return fetchQuery(api.auth.users.getUserById, {
    id,
  });
};
