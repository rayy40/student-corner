"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { email } from "@/actions/login";
import { loginSchema } from "@/schema/authentication_schema";
import { zodResolver } from "@hookform/resolvers/zod";

import { SubmitButton } from "../ui/button";
import { FormError } from "../ui/form-error";
import { Label } from "../ui/label";
import Social from "./social";
import { Input } from "../ui/input";

type SignInSchema = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider"
      : "";
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: SignInSchema) => {
    setError(undefined);

    startTransition(() => {
      email(values).then((data) => {
        reset();
        setError(data?.error);
      });
    });
  };

  return (
    <>
      <form
        noValidate
        className="w-[350px] flex flex-col gap-4 border-b border-border py-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <Label label="email" />
          <Input
            onFocus={() => setError(undefined)}
            className="border-gray-200 bg-input"
            itemType="email"
            id="email"
            placeholder="johndoe@gmail.com"
            isDisabled={isSubmitting}
            {...register("email")}
          />
          <FormError error={errors.email} />
        </div>
        <FormError className="p-[10px] mt-0" error={error || urlError} />
        <SubmitButton isDisabled={isSubmitting}>Sign In</SubmitButton>
      </form>
      <Social />
    </>
  );
};

export default LoginForm;
