import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardWrapper = ({ children, className, ...props }: Props) => {
  return (
    <div
      className={cn(
        "rounded-md border flex flex-col gap-4 items-center justify-center text-center p-6 border-border w-[350px] h-[350px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
