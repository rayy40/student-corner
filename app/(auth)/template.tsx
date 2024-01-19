"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";

const Template = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="font-sans relative max-w-[1400px] mx-auto w-full h-full">
      <div className="absolute flex flex-col items-end gap-2 top-10 right-10">
        <p className="text-muted-foreground">
          {pathname === "/sign-in"
            ? "Don't have an account?"
            : "Already have an account?"}
        </p>
        <button className="transition-colors bg-muted hover:bg-muted-hover p-2 border border-[#ccc] rounded-md shadow-light">
          <Link href={pathname === "/sign-in" ? "/sign-up" : "/sign-in"}>
            {pathname === "/sign-in" ? "Sign Up" : "Sign In"}
          </Link>
        </button>
      </div>
      {children}
    </div>
  );
};

export default Template;
