import { importPKCS8, SignJWT } from "jose";
import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { ConvexAdapter } from "@/app/ConvexAdapter";

import { sendVerificationRequest as send } from "./lib/mail";

//TOOD: Look into other email providers and fix resend

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(
  /.cloud$/,
  ".site"
);

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  }),
  Github({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  }),
  Resend({
    name: "email",
    sendVerificationRequest({
      identifier,
      url,
      token,
      provider: { server, from },
    }) {
      send({ identifier, url, token, server, from });
    },
  }),
];

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers,
  adapter: ConvexAdapter,
  pages: {
    signIn: "/login",
    // error: "/error",
    verifyRequest: "/verify",
  },
  callbacks: {
    async session({ session }) {
      const privateKey = await importPKCS8(
        process.env.CONVEX_AUTH_PRIVATE_KEY!,
        "RS256"
      );
      const convexToken = await new SignJWT({
        email: session.user.email,
        sub: session.userId,
      })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setIssuer(CONVEX_SITE_URL)
        .setAudience("convex")
        .setExpirationTime("1h")
        .sign(privateKey);
      return { ...session, convexToken };
    },
  },
});

declare module "next-auth" {
  interface Session {
    convexToken: string;
  }
}
