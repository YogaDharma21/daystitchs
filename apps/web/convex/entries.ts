import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

type Ctx = {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any;
};

async function callerUserId(ctx: Ctx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

export const listRange = queryGeneric({
  args: { start: v.string(), end: v.string() },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: Ctx, args: any) => {
    const userId = await callerUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("entries")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_user_date", (q: any) =>
        q.eq("userId", userId).gte("date", args.start).lte("date", args.end),
      )
      .order("asc")
      .collect();
  },
});

export const toggleDone = mutationGeneric({
  args: { id: v.id("entries") },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: Ctx, args: any) => {
    const userId = await callerUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== userId) throw new Error("Entry not found");
    await ctx.db.patch(args.id, { done: !doc.done });
  },
});
