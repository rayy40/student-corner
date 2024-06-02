"use client";

import { handleSignOut } from "@/actions/login";
import Link from "next/link";
import { useTransition } from "react";
import { LuLoader2 } from "react-icons/lu";

export const SignOut = ({ isSignedIn }: { isSignedIn: boolean }) => {
  const [isPending, setTransition] = useTransition();

  const onSubmit = () => {
    setTransition(() => {
      handleSignOut().then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        return;
      });
    });
  };

  return (
    <div className="flex items-center justify-center p-2 border rounded-md bg-input enabled:hover:bg-input/80 border-border shadow-light">
      {isSignedIn ? (
        <form action={onSubmit}>
          <button disabled={isPending} type="submit">
            {isPending ? <LuLoader2 /> : "Sign Out"}
          </button>
        </form>
      ) : (
        <Link href={"/login"}>Sign In</Link>
      )}
    </div>
  );
};
