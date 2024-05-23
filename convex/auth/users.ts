import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    console.log("server identity", await ctx.auth.getUserIdentity());
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();

      return user;
    } catch (error) {
      return null;
    }
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), id))
        .unique();
      return user;
    } catch (error) {
      return null;
    }
  },
});
