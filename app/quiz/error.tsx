"use client";

import { ConvexError } from "convex/values";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname();
  const goToPath = pathname.substring(0, pathname.lastIndexOf("/"));

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <h2 className="text-lg text-center text-error">
        {error instanceof ConvexError
          ? error.data
          : error.message
            ? error.message
            : "Unexpected Error occured"}
      </h2>
      <Link href={goToPath}>
        <button className="px-4 py-2 transition-colors border rounded-md border-border text-secondary-foreground bg-secondary hover:bg-secondary-hover">
          Go back
        </button>
      </Link>
    </div>
  );
}
