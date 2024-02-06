import React from "react";
import Link from "next/link";
import { ConvexError } from "convex/values";

type Props = {
  error: Error;
  pathname: string;
};

const ErrorBoundary = ({ error, pathname }: Props) => {
  const goToPath = pathname.substring(0, pathname.lastIndexOf("/"));

  return (
    <div className="flex  text-lg flex-col gap-1 font-sans items-center justify-center w-full h-screen">
      <h2>
        {error instanceof ConvexError ? error.data : "Unexpected Error occured"}
      </h2>
      <Link
        className=" underline underline-offset-2 hover:no-underline hover:text-secondary-foreground transition-colors "
        href={goToPath}
      >
        Go back
      </Link>
    </div>
  );
};

export default ErrorBoundary;
