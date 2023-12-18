import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

interface UserIdStoreState {
  userId: Id<"users"> | null;
  setUserId: (userId: Id<"users"> | null) => void;
}

export const useUserIdStore = create<UserIdStoreState>((set) => ({
  userId: null,
  setUserId: (userId) => set((state) => ({ userId })),
}));
