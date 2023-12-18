"use client";

import { z } from "zod";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldValues } from "react-hook-form";
import { signInSchema } from "@/schema/authentication_schema";
import { OAuthStrategy } from "@clerk/types";
import { useSignIn } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";

type signInSchema = z.infer<typeof signInSchema>;

const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInSchema>({
    resolver: zodResolver(signInSchema),
  });
  const router = useRouter();

  const signInWith = async (strategy: OAuthStrategy) => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    console.log(data);
    if (!isLoaded) {
      return;
    }

    setLoadingSignIn(true);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        console.log(result);
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        /*Investigate why the login hasn't completed */
        console.log(result);
      }
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage);
      setError(err.errors[0].longMessage);
    } finally {
      setLoadingSignIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-foreground">
      <h1 className="mb-4 text-5xl">Sign In</h1>
      <form
        noValidate
        className="w-[350px] flex flex-col gap-4 border-b border-border py-8"
        action="/"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-label" htmlFor="email">
            Email
          </label>
          <input
            className="p-2 border border-gray-200 rounded-md bg-input shadow-input"
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register("email")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-semibold text-label"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="p-2 border border-gray-200 rounded-md bg-input shadow-input"
            type="password"
            id="password"
            placeholder="Enter your password"
            {...register("password")}
          />
        </div>
        {error && <p className="text-center text-error">{error}</p>}
        <button
          disabled={loadingSignIn ? true : false}
          className="flex items-center justify-center w-full gap-2 p-2 mt-2 font-semibold rounded-md cursor-pointer enabled:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loadingSignIn && (
            <LuLoader2 className="animate-spin" size={"1.25rem"} />
          )}
          Sign In
        </button>
      </form>
      <div className="mt-6 w-[350px] flex flex-col gap-4">
        <button
          onClick={() => signInWith("oauth_google")}
          className="flex items-center justify-center w-full gap-2 p-2 border rounded-md cursor-pointer shadow-light hover:bg-input border-border"
        >
          <FcGoogle size={"1.5rem"} />
          Continue with Google
        </button>
        <button
          onClick={() => signInWith("oauth_github")}
          className="flex items-center justify-center w-full gap-2 p-2 border rounded-md cursor-pointer shadow-light hover:bg-input border-border"
        >
          <FaGithub size={"1.5rem"} />
          Continue with Github
        </button>
      </div>
    </div>
  );
};

export default SignIn;
