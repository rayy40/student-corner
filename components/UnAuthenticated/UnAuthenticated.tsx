import Link from "next/link";
import React from "react";

const UnAuthenticated = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-lg">
      <p>You are not signed in,</p>
      <p className="underline cursor-pointer underline-offset-2">
        <Link href={"/sign-in"}>Go to Sign In page.</Link>
      </p>
    </div>
  );
};

export default UnAuthenticated;