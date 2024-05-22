import { ConvexAdapter } from "@/app/ConvexAdapter";
import NextAuth from "next-auth";
import { SignJWT, importPKCS8 } from "jose";

import authConfig from "@/auth.config";
import { Id } from "./convex/_generated/dataModel";
import { getUserByEmail, updateUserEmailVerification } from "@/db/user";
import { generateToken } from "./helpers/tokens";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(
  /.cloud$/,
  ".site"
);

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  debug: true,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await updateUserEmailVerification(user.id as Id<"users">);
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("USER", user);
      console.log("ACCOUNT", account);
      if (account?.provider !== "credentials") return true;

      if (!user.email) return false;

      const existingUser = await getUserByEmail(user.email);

      if (!existingUser?.emailVerified) return false;

      return true;
    },
    // async jwt({ user }) {
    //   const session = await ConvexAdapter?.createSession?.({
    //     sessionToken:
    //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    //     userId: user.id!,
    //     expires: new Date(Date.now() + 3600 * 1000),
    //   });

    //   return { id: session?.sessionToken };
    // },
    async session({ session, token, user }) {
      const privateKey = await importPKCS8(
        process.env.CONVEX_AUTH_PRIVATE_KEY!,
        "RS256"
      );
      const convexToken = await new SignJWT({
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
  // jwt: {
  //   async encode({ token }) {
  //     return token?.id as unknown as string;
  //   },
  //   async decode() {
  //     return null;
  //   },
  // },
  adapter: ConvexAdapter,
  ...authConfig,
});

declare module "next-auth" {
  interface Session {
    expires: string;
    userId: Id<"users">;
    convexToken: string;
    sessionToken: string;
    user: {
      _creationTime: number;
      _id: Id<"users">;
      email: string;
      emailVerified?: number;
      image?: string;
      name?: string;
      id: string;
    };
  }
}
