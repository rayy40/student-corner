"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { useUserIdStore } from "@/providers/user-store";
import { useAuth, useClerk } from "@clerk/clerk-react";

import logo from "../assets/logo.svg";

const Navbar = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const { setUserId } = useUserIdStore();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={`font-sans fixed top-0 z-10 ${
        ["/sign-in", "/sign-up"].includes(pathname) ? "hidden" : "flex"
      } items-center justify-between w-full p-3 bg-white shadow-medium`}
    >
      <Link href={"/"}>
        <Image priority width={40} height={40} src={logo} alt="logo" />
      </Link>
      <button
        onClick={() =>
          isSignedIn
            ? signOut(() => {
                setUserId(null);
                router.push("/");
              })
            : router.push("/sign-up")
        }
        className="p-2 transition-colors border rounded-md hover:bg-muted-hover border-border bg-muted shadow-light"
      >
        {isSignedIn ? "Sign Out" : "Sign Up"}
      </button>
    </div>
  );
};

export default Navbar;
