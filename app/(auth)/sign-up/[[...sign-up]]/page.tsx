"use client";

import { z } from "zod";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldValues } from "react-hook-form";
import { signUpSchema } from "@/schema/authentication_schema";

type signUpSchema = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: FieldValues) => {
    console.log(data);
  };

  return (
    <div className="flex text-foreground flex-col gap-2 items-center justify-center h-full w-full">
      <h1 className="mb-4 text-5xl">Sign Up</h1>
      <form
        className="w-[350px] flex flex-col gap-4 border-b border-border py-8"
        action="/"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <label className="text-label font-semibold text-xs" htmlFor="email">
            Email
          </label>
          <input
            className=" rounded-md p-2 border border-gray-200 bg-input shadow-input"
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register("email")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-label font-semibold text-xs"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className=" rounded-md p-2 border border-gray-200 bg-input shadow-input"
            type="password"
            id="password"
            placeholder="Enter your password"
            {...register("password")}
          />
        </div>
        <button className="hover:bg-primary-hover cursor-pointer mt-2 p-2 w-full bg-primary text-primary-foreground font-semibold shadow-button rounded-md">
          Get Code
        </button>
      </form>
      <div className="mt-6 w-[350px] flex flex-col gap-4">
        <button className="flex items-center gap-2 justify-center cursor-pointer shadow-light hover:bg-input border border-border p-2 w-full rounded-md">
          <FcGoogle size={"1.5rem"} />
          Continue with Google
        </button>
        <button className="flex items-center gap-2 justify-center cursor-pointer shadow-light hover:bg-input border border-border p-2 w-full rounded-md">
          <FaGithub size={"1.5rem"} />
          Continue with Github
        </button>
      </div>
    </div>
  );
};

export default SignUp;
