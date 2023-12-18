"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

import { useUserIdStore } from "@/providers/store";
import { useAuth, useClerk } from "@clerk/clerk-react";
import logo from "../../assets/logo.svg";
import Link from "next/link";

const Navbar = () => {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const { setUserId } = useUserIdStore();
  const router = useRouter();

  if (!isLoaded) {
    return;
  }

  return (
    <div
      className={`fixed top-0 z-10 ${
        isSignedIn ? "flex" : "hidden"
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
        className="p-2 transition-colors border rounded-md hover:bg-accent-hover border-border bg-accent shadow-light"
      >
        {isSignedIn ? "Sign Out" : "Sign Up"}
      </button>
    </div>
  );
};

export default Navbar;
