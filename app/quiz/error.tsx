"use client";

import { ConvexError } from "convex/values";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuAlertTriangle } from "react-icons/lu";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname();
  const goToPath = pathname.substring(0, pathname.lastIndexOf("/"));

  const err =
    error instanceof ConvexError
      ? (error.data as { message: string }).message
      : error.message;

  const customError = err.length > 150 ? "Something went wrong." : err;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <LuAlertTriangle className="text-5xl text-error" />
      <p className="text-lg text-center text-error">{customError}</p>
      <Link href={goToPath}>
        <button className="px-4 py-2 transition-colors border rounded-md border-border shadow-light text-foreground/80 bg-input hover:input/80">
          Go Back
        </button>
      </Link>
    </div>
  );
}
