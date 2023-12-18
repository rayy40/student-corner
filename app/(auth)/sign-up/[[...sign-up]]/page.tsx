"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { LuLoader2 } from "react-icons/lu";
import { z } from "zod";

import { signUpSchema } from "@/schema/authentication_schema";
import { useSignUp } from "@clerk/clerk-react";
import { OAuthStrategy } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";

type signUpSchema = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState({
    verification: false,
    signUp: false,
    google: false,
    github: false,
  });
  const { isLoaded, signUp, setActive } = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpSchema>({
    resolver: zodResolver(signUpSchema),
  });
  const router = useRouter();

  const signUpWith = async (strategy: OAuthStrategy) => {
    try {
      setLoading((prev) => ({
        ...prev,
        [strategy === "oauth_google" ? "google" : "github"]: true,
      }));

      await signUp?.authenticateWithRedirect({
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
    console.log(data);
    if (!isLoaded) {
      return;
    }

    setLoading((prev) => ({ ...prev, verification: true }));

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading((prev) => ({ ...prev, verification: true }));
    }
  };

  const onPressVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    setLoading((prev) => ({ ...prev, signUp: true }));

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== "complete") {
        /*  investigate the response, to see if there was an error
         or if the user needs to complete more steps.*/
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading((prev) => ({ ...prev, signUp: false }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-foreground">
      <h1 className="mb-4 text-5xl font-semibold">Sign Up</h1>
      {!pendingVerification && (
        <form
          className="w-[350px] flex flex-col gap-4 border-b border-border py-8"
          action="/"
          noValidate
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
          <button
            disabled={loading.verification ? true : false}
            className="flex items-center justify-center w-full gap-2 p-2 mt-2 font-semibold rounded-md cursor-pointer enabled:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading.verification && (
              <LuLoader2 className="animate-spin" size={"1.25rem"} />
            )}
            Get Code
          </button>
        </form>
      )}
      {pendingVerification && (
        <form
          className="w-[350px] flex flex-col gap-4 border-b border-border py-8"
          onSubmit={onPressVerify}
        >
          <p className="text-center text-secondary-foreground">
            We just sent you a temporary login code. Please check your inbox.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-label" htmlFor="code">
              Code
            </label>
            <input
              className="p-2 border border-gray-200 rounded-md bg-input shadow-input"
              type="text"
              id="code"
              placeholder="Paste code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button
            disabled={loading.signUp ? true : false}
            className="flex items-center justify-center w-full gap-2 p-2 mt-2 font-semibold transition-colors rounded-md cursor-pointer active:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading.signUp && (
              <LuLoader2 className="animate-spin" size={"1.25rem"} />
            )}
            Sign Up
          </button>
        </form>
      )}
      <div className="mt-6 w-[350px] flex flex-col gap-4">
        <button
          disabled={loading.google ? true : false}
          onClick={() => signUpWith("oauth_google")}
          className="flex items-center justify-center w-full gap-2 p-2 transition-colors border rounded-md cursor-pointer  shadow-light hover:bg-input border-border"
        >
          {loading.google ? (
            <LuLoader2 className="animate-spin" size={"1.25rem"} />
          ) : (
            <FcGoogle size={"1.5rem"} />
          )}
          Continue with Google
        </button>
        <button
          onClick={() => signUpWith("oauth_github")}
          className="flex items-center justify-center w-full gap-2 p-2 transition-colors border rounded-md cursor-pointer  shadow-light hover:bg-input border-border"
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
  );
};

export default SignUp;
