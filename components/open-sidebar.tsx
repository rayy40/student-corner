"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LuText } from "react-icons/lu";

export const OpenSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isSidebarOpen = searchParams.get("sidebar") || "false";

  const handleSidebar = (isOpen: string) => {
    const current = new URLSearchParams(searchParams);

    const value = isOpen === "true" ? "false" : "true";

    current.set("sidebar", value);

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  return (
    <LuText
      onClick={() => handleSidebar(isSidebarOpen)}
      className="text-xl cursor-pointer z-20"
    />
  );
};
