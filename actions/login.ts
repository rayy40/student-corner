"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { loginSchema } from "@/schema/authentication_schema";
import { redirect } from "next/navigation";

type LoginSchema = z.infer<typeof loginSchema>;

export const email = async (values: LoginSchema) => {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invdalid fields" };
  }

  try {
    await signIn("resend", {
      email: values.email,
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "Verification":
          return { error: "Verification error" };
        default:
          return { error: "Something went wrong" };
      }
    }

    throw error;
  }

  redirect("/");
};

export const social = async (provider: "google" | "github") => {
  if (!provider) {
    return { error: "No provider provided." };
  }

  try {
    await signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "InvalidProvider":
          return { error: "Invalid provider." };
        default:
          return { error: "Something went wrong" };
      }
    }

    throw error;
  }

  redirect("/");
};
