import React from "react";

import { cn } from "@/helpers/utils";
import { FieldError } from "react-hook-form";

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: FieldError | string;
}

export const FormError = ({ error, ...props }: Props) => {
  if (!error) return null;

  //maybe add background and danger email
  return (
    <p
      className={cn("mt-1 text-center text-error", {
        ...props,
      })}
    >
      {typeof error === "string" ? error : error.message}
    </p>
  );
};
