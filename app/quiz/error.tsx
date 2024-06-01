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
      <LuAlertTriangle className="text-error text-5xl" />
      <p className="text-lg text-center text-error">{customError}</p>
      <Link href={goToPath}>
        <button className="px-4 py-2 transition-colors shadow-light border rounded-md border-red-200 text-foreground/80 bg-red-100 hover:bg-red-50 ">
          Go Back
        </button>
      </Link>
    </div>
  );
}
