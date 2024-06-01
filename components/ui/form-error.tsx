import React from "react";

import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: FieldError | string;
  className?: string;
}

export const FormError = ({ error, className, ...props }: Props) => {
  if (!error) return null;

  return (
    <p
      className={cn(
        "mt-1 p-4 w-full rounded-md bg-red-100 font-medium text-center text-error",
        className
      )}
      {...props}
    >
      {typeof error === "string" ? error : error.message}
    </p>
  );
};
