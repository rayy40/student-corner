import React from "react";
import { FieldError } from "react-hook-form";

import { YTVideoType } from "@/types";

const YTVideo = <K extends string>({
  format,
  isSubmitted,
  errors,
  register,
}: YTVideoType<K>) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-label">YTVideo</div>
      <input
        type="text"
        className="w-full p-2 border border-gray-200 rounded-md bg-input shadow-input"
        placeholder="Paste your link."
        id="link"
        {...register("link")}
      />
      {isSubmitted && format === "link" && (
        <p className="mt-2 text-[0.95rem] text-center text-error">
          {(errors as { link?: FieldError }).link?.message}
        </p>
      )}
    </div>
  );
};

export default YTVideo;
