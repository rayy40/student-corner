import React from "react";

export const Label = ({ label }: { label: string }) => {
  return (
    <label
      className="text-xs font-semibold capitalize text-label"
      htmlFor={label}
    >
      {label}
    </label>
  );
};
