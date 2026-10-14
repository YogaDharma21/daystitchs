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

const dateRule = v.string();
const titleRule = v.string();
const typeRule = v.union(v.literal("event"), v.literal("task"));

function assertDraft(args: {
  date: string;
  title: string;
  type: string;
}): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) throw new Error("Date is required");
  if (!args.title || !args.title.trim()) throw new Error("Title is required");
  if (args.title.trim().length > 80) throw new Error("Title is too long");
  if (args.type !== "event" && args.type !== "task")
    throw new Error("Unknown entry type");
}

export const create = mutationGeneric({
  args: {
    date: dateRule,
    title: titleRule,
    type: typeRule,
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    time: v.optional(v.string()),
    loc: v.optional(v.string()),
    detail: v.optional(v.string()),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: Ctx, args: any) => {
    const userId = await callerUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    assertDraft(args);
    const title = args.title.trim();
    const doc: Record<string, unknown> = {
      userId,
      date: args.date,
      title,
      type: args.type,
    };
    if (args.type === "event") {
      if (args.start) doc.start = args.start;
      if (args.end) doc.end = args.end;
      if (args.loc?.trim()) doc.loc = args.loc.trim().slice(0, 60);
    } else {
      if (args.time) doc.time = args.time;
      doc.done = false;
    }
    if (args.detail?.trim()) doc.detail = args.detail.trim().slice(0, 120);
    return await ctx.db.insert("entries", doc as never);
  },
});

export const update = mutationGeneric({
  args: {
    id: v.id("entries"),
    date: dateRule,
    title: titleRule,
    type: typeRule,
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    time: v.optional(v.string()),
    loc: v.optional(v.string()),
    detail: v.optional(v.string()),
    done: v.optional(v.boolean()),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: Ctx, args: any) => {
    const userId = await callerUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== userId) throw new Error("Entry not found");
    assertDraft(args);
    const patch: Record<string, unknown> = {
      date: args.date,
      title: args.title.trim(),
      type: args.type,
      start: undefined,
      end: undefined,
      time: undefined,
      loc: undefined,
      detail: undefined,
    };
    if (args.type === "event") {
      if (args.start) patch.start = args.start;
      if (args.end) patch.end = args.end;
      if (args.loc?.trim()) patch.loc = args.loc.trim().slice(0, 60);
    } else {
      if (args.time) patch.time = args.time;
      patch.done = args.done ?? doc.done ?? false;
    }
    if (args.detail?.trim()) patch.detail = args.detail.trim().slice(0, 120);
    if (args.type === "event" && args.done !== undefined)
      patch.done = args.done;
    await ctx.db.patch(args.id, patch as never);
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("entries") },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: Ctx, args: any) => {
    const userId = await callerUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== userId) throw new Error("Entry not found");
    await ctx.db.delete(args.id);
  },
});
