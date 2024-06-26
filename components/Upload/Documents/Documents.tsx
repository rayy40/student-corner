"use client";

import React from "react";
import { FieldError, useFormContext } from "react-hook-form";
import { LuFileUp } from "react-icons/lu";

const Document = () => {
  const {
    register,
    formState: { errors, isSubmitted },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-label">Document</div>
      <div className="p-2 w-full h-[150px] bg-input-background rounded-md shadow-[inset_0_0_6px_-2px_rgba(15,15,15,0.25)]">
        <div className="cursor-pointer relative bg-input rounded-md border-2 bg-light-gray border-dotted border-dark-gray w-full h-full flex items-center justify-center shadow-[inset_0_0_6px_-2px_rgba(15,15,15,0.25)]">
          <label
            className="flex items-center justify-center w-full h-full rounded-md"
            htmlFor="files"
          >
            <div className="flex items-center gap-2 p-2 px-3 text-sm border rounded-md border-border bg-muted shadow-light">
              <LuFileUp /> Upload PDFs
            </div>
          </label>
          <input
            type="file"
            id="files"
            className="absolute w-0 h-0 opacity-0 -z-10"
            {...register("files")}
          />
        </div>
      </div>
      {isSubmitted && (
        <p className="mt-2 text-[0.95rem] text-center text-error">
          {(errors as { files?: FieldError }).files?.message}
        </p>
      )}
    </div>
  );
};

export default Document;
