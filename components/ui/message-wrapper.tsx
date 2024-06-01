import { cn } from "@/lib/utils";
import { MessageRole } from "@/lib/types";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  role?: MessageRole;
};

export const MessageWrapper = ({
  children,
  className,
  role = "assistant",
}: Props) => {
  return (
    <div
      className={cn(
        " text-foreground max-w-[60ch] w-fit py-3 px-4 mb-2 overflow-x-auto border border-border rounded-lg shadow-input",
        className,
        {
          "bg-input mr-auto": role === "assistant",
          "bg-[#f4f4f4] ml-auto": role === "user",
        }
      )}
    >
      {children}
    </div>
  );
};
