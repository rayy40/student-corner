import { mutation } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token" as never, (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the email has changed, patch the value.
      if (user.userId !== identity.subject) {
        await ctx.db.patch(user._id, { userId: identity.subject });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    console.log(identity);
    return await ctx.db.insert("users", {
      userId: identity.subject,
      email: identity.email!,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
