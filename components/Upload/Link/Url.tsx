import React from "react";
import { FieldErrors } from "react-hook-form";

import { UrlType } from "@/types";

const Url = <K extends string>({
  format,
  isSubmitted,
  errors,
  register,
  setValue,
  repo,
}: UrlType<K>) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-label capitalize">{format} Url</div>
        <input
          type="text"
          className="w-full p-2 border border-gray-200 rounded-md bg-input shadow-input"
          placeholder="Paste your link."
          id={format}
          {...register(format)}
        />
      </div>
      {format === "github" && (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-label">Repository</div>
          <div className="flex items-center w-full border rounded-md border-border">
            <button
              onClick={() => {
                setValue && setValue("repo", "public");
              }}
              className={`p-2 transition-colors text-secondary-foreground rounded-l-md ${
                repo === "public" ? "bg-secondary-hover" : "bg-secondary"
              } hover:bg-secondary-hover shadow-input grow`}
            >
              Public
            </button>
            <button
              onClick={() => {
                setValue && setValue("repo", "private");
              }}
              className={`p-2 transition-colors text-secondary-foreground border-x ${
                repo === "private" ? "bg-secondary-hover" : "bg-secondary"
              } hover:bg-secondary-hover shadow-input grow`}
            >
              Private
            </button>
          </div>
        </div>
      )}
      {isSubmitted && Object.keys(errors).length > 0 && (
        <p className="mt-2 text-[0.95rem] text-center text-error">
          {(errors as FieldErrors)?.[format]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Url;
