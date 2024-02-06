import LoadingSpinner from "@/components/LoadingSpinner";
import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <LoadingSpinner />
    </div>
  );
};

export default Loading;
