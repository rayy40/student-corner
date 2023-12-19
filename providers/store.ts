import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Id } from "@/convex/_generated/dataModel";

interface UserIdStoreState {
  userId: Id<"users"> | null;
  setUserId: (userId: Id<"users"> | null) => void;
}

export const useUserIdStore = create(
  persist<UserIdStoreState>(
    (set) => ({
      userId: null,
      setUserId: (userId) => set((state) => ({ userId })),
    }),
    {
      name: "userId",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
