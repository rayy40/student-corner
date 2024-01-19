"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { LuLoader2 } from "react-icons/lu";
import { z } from "zod";

import { signInSchema } from "@/schema/authentication_schema";
import { useSignIn } from "@clerk/clerk-react";
import { OAuthStrategy } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";

type signInSchema = z.infer<typeof signInSchema>;

const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [loading, setLoading] = useState({
    signIn: false,
    google: false,
    github: false,
  });
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
      setLoading((prev) => ({
        ...prev,
        [strategy === "oauth_google" ? "google" : "github"]: true,
      }));

      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({
        ...prev,
        google: strategy !== "oauth_google" ? false : prev.google,
        github: strategy === "oauth_google" ? false : prev.github,
      }));
    }
  };

  const onSubmit = async (data: FieldValues) => {
    if (!isLoaded) {
      return;
    }

    setLoading((prev) => ({ ...prev, signIn: true }));

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage);
      setError(err.errors[0].longMessage);
    } finally {
      setLoading((prev) => ({ ...prev, signIn: false }));
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full gap-2 font-sans text-foreground">
        <h1 className="mb-4 text-5xl font-semibold">Sign In</h1>
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
            {errors.email && (
              <p className="mt-1 text-center text-error">
                {errors.email?.message}
              </p>
            )}
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
            {errors.password && (
              <p className="mt-1 text-center text-error">
                {errors.password?.message}
              </p>
            )}
          </div>
          {error && <p className="text-center text-error">{error}</p>}
          <button
            disabled={loading.signIn ? true : false}
            className="flex items-center justify-center w-full gap-2 p-2 mt-2 font-semibold transition-colors rounded-md cursor-pointer enabled:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading.signIn && (
              <LuLoader2 className="animate-spin" size={"1.25rem"} />
            )}
            Sign In
          </button>
        </form>
        <div className="mt-6 w-[350px] flex flex-col gap-4">
          <button
            disabled={loading.google ? true : false}
            onClick={() => signInWith("oauth_google")}
            className="flex items-center justify-center w-full gap-2 p-2 transition-colors border rounded-md cursor-pointer shadow-light hover:bg-input border-border"
          >
            {loading.google ? (
              <LuLoader2 className="animate-spin" size={"1.25rem"} />
            ) : (
              <FcGoogle size={"1.5rem"} />
            )}
            Continue with Google
          </button>
          <button
            disabled={loading.github ? true : false}
            onClick={() => signInWith("oauth_github")}
            className="flex items-center justify-center w-full gap-2 p-2 transition-colors border rounded-md cursor-pointer shadow-light hover:bg-input border-border"
          >
            {loading.github ? (
              <LuLoader2 className="animate-spin" size={"1.25rem"} />
            ) : (
              <FaGithub size={"1.5rem"} />
            )}
            Continue with Github
          </button>
        </div>
      </div>
    </>
  );
};

export default SignIn;
