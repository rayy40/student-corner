"use client";

import { usePathname } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

export default function Error({ error }: { error: Error }) {
  const pathname = usePathname();

  return <ErrorBoundary error={error} pathname={pathname} />;
}
