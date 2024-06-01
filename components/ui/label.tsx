import React from "react";

export const Label = ({ label }: { label: string }) => {
  return (
    <label
      className="text-sm font-semibold capitalize md:text-[1rem] text-label"
      htmlFor={label}
    >
      {label}
    </label>
  );
};
