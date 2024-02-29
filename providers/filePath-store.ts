import { FilePath } from "@/types";
import { createWithEqualityFn } from "zustand/traditional";

const initialState: FilePath[] = [];

export const useFilePathStore = createWithEqualityFn<{
  filePath: FilePath[];
  setFilePath: (filePath: FilePath) => void;
}>((set) => ({
  filePath: initialState,
  setFilePath: (filePath: FilePath) =>
    set((state: any) => ({
      filePath: [...state.filePath, filePath],
    })),
}));
