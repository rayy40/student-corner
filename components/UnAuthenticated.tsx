import Link from "next/link";
import React from "react";

const UnAuthenticated = () => {
  return (
    <div className="flex font-sans flex-col items-center justify-center w-full h-screen text-lg">
      <p>You are not signed in,</p>
      <p className="underline cursor-pointer underline-offset-2">
        <Link href={"/sign-in"}>Go to Sign In page.</Link>
      </p>
    </div>
  );
};

export default UnAuthenticated;
