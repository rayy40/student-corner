"use client";

import { useState, useTransition } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { LuLoader2 } from "react-icons/lu";

import { social } from "@/actions/login";

import { FormError } from "../ui/form-error";
import { SubmitButton } from "../ui/button";
import { useSearchParams } from "next/navigation";

const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [isSubmittingGoogle, startTransitionForGoogle] = useTransition();
  const [isSubmittingGithub, startTransitionForGithub] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  const onClick = async (provider: "google" | "github") => {
    if (provider === "google") {
      startTransitionForGoogle(() => {
        social("google", callbackUrl).then((data) => setError(data?.error));
      });
    } else if (provider === "github") {
      startTransitionForGithub(() => {
        social("github", callbackUrl).then((data) => setError(data?.error));
      });
    }
  };

  return (
    <>
      <div className="mt-6 w-[350px] flex flex-col gap-4">
        <SubmitButton
          className="font-normal border shadow-sm bg-secondary text-foreground border-border enabled:hover:bg-input disabled:opacity-20"
          disabled={isSubmittingGoogle || isSubmittingGithub}
          onClick={() => onClick("google")}
        >
          {isSubmittingGoogle && (
            <LuLoader2 className="animate-spin" size={"1.25rem"} />
          )}
          <FcGoogle size={"1.25rem"} />
          Continue with Google
        </SubmitButton>
        <SubmitButton
          className="font-normal border shadow-sm bg-secondary text-foreground border-border enabled:hover:bg-input disabled:opacity-20"
          disabled={isSubmittingGoogle || isSubmittingGithub}
          onClick={() => onClick("github")}
        >
          {isSubmittingGithub && (
            <LuLoader2 className="animate-spin" size={"1.25rem"} />
          )}
          <FaGithub size={"1.25rem"} />
          Continue with Github
        </SubmitButton>
      </div>
      <FormError className="mt-0" error={error} />
    </>
  );
};

export default Social;
