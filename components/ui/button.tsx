import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, FC, ReactNode, forwardRef } from "react";
import { LuLoader2 } from "react-icons/lu";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isDisabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}

// eslint-disable-next-line react/display-name
const SubmitButton: FC<ButtonProps> = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ isDisabled, children, className, onClick }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      type="submit"
      disabled={isDisabled}
      className={cn(
        "flex items-center justify-center w-full gap-[10px] p-[10px] mt-2 font-semibold transition-colors rounded-md cursor-pointer enabled:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40",
        className
      )}
    >
      {isDisabled && <LuLoader2 className="animate-spin" size={"1.25rem"} />}
      {children}
    </button>
  );
});

// eslint-disable-next-line react/display-name
const NextPrevButton: FC<ButtonProps> = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    { isDisabled, className, children, type = "button", onClick, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        type={type}
        disabled={isDisabled}
        className={cn(
          "p-[10px] px-3 border rounded-md disabled:opacity-40 bg-muted enabled:hover:bg-muted-hover shadow-button border-border",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export { SubmitButton, NextPrevButton };
