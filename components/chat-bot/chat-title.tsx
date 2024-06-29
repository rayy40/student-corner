"use client";

import { useContent } from "@/providers/content-provider";

export const ChatTitle = ({ title }: { title: string }) => {
  const { title: resolvedTitle } = useContent();
  return <>{resolvedTitle ?? title}</>;
};
