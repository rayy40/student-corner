import { cn } from "@/lib/utils";
import {
  FC,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isDisabled?: boolean;
  className?: string;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isDisabled?: boolean;
  className?: string;
  rows?: number;
  cols?: number;
}

// eslint-disable-next-line react/display-name
const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
  ({ isDisabled, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "p-[10px] border rounded-md border-border shadow-input bg-secondary",
          className
        )}
        {...props}
      />
    );
  }
);

// eslint-disable-next-line react/display-name
const TextArea: FC<TextAreaProps> = forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>(({ isDisabled, className, rows, cols, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      cols={cols}
      disabled={isDisabled}
      className={cn(
        "p-[10px] border rounded-md border-border shadow-input bg-secondary",
        className
      )}
      {...props}
    />
  );
});

export { TextArea, Input };
