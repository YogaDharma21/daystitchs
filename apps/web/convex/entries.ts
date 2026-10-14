import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import { assertEntryDraft } from "./entryRules";

// Local document shape. Full end-to-end typing comes from codegen once the
// owner runs `convex dev`; until then this keeps every db boundary typed
// without `any` or casts in this file.
interface EntryDoc {
  _id: string;
  userId: string;
  date: string;
  title: string;
  type: "event" | "task";
  start?: string;
  end?: string;
  time?: string;
  loc?: string;
  detail?: string;
  done?: boolean;
}

interface AuthProvider {
  getUserIdentity: () => Promise<{ subject: string } | null>;
}

async function callerUserId(auth: AuthProvider): Promise<string | null> {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

async function requireUserId(auth: AuthProvider): Promise<string> {
  const userId = await callerUserId(auth);
  if (!userId) throw new Error("Not signed in");
  return userId;
}

async function requireOwnedDoc(
  userId: string,
  load: () => Promise<EntryDoc | null>,
): Promise<EntryDoc> {
  const doc = await load();
  if (!doc || doc.userId !== userId) throw new Error("Entry not found");
  return doc;
}

export const listRange = queryGeneric({
  args: { start: v.string(), end: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx.auth);
    if (!userId) return [];
    // NOTE: with codegen (`convex dev`) this becomes a full index range
    // q.eq("userId", …).gte("date", …).lte("date", …). Without generated
    // types the any-model cannot step compound-index fields, so the date
    // bounds live in a filter until then. Same rows, one query.
    return await ctx.db
      .query("entries")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.start),
          q.lte(q.field("date"), args.end),
        ),
      )
      .order("asc")
      .collect();
  },
});

export const toggleDone = mutationGeneric({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx.auth);
    const doc = await requireOwnedDoc(userId, () => ctx.db.get(args.id));
    if (doc.type !== "task") throw new Error("Only tasks track done");
    await ctx.db.patch(args.id, { done: !doc.done });
  },
});

const dateRule = v.string();
const titleRule = v.string();
const typeRule = v.union(v.literal("event"), v.literal("task"));

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
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx.auth);
    // Rejects overlong title/loc/detail with an error (no silent truncation).
    assertEntryDraft(args);
    const title = args.title.trim();
    const doc: Record<string, string | boolean> = {
      userId,
      date: args.date,
      title,
      type: args.type,
    };
    if (args.type === "event") {
      if (args.start) doc.start = args.start;
      if (args.end) doc.end = args.end;
      if (args.loc?.trim()) doc.loc = args.loc.trim();
    } else {
      if (args.time) doc.time = args.time;
      doc.done = false;
    }
    if (args.detail?.trim()) doc.detail = args.detail.trim();
    return await ctx.db.insert("entries", doc);
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
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx.auth);
    const doc = await requireOwnedDoc(userId, () => ctx.db.get(args.id));
    assertEntryDraft(args);
    const patch: Record<string, string | boolean | undefined> = {
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
      if (args.loc?.trim()) patch.loc = args.loc.trim();
      // done is Task-only: never accept it on events.
    } else {
      if (args.time) patch.time = args.time;
      patch.done = args.done ?? doc.done ?? false;
    }
    if (args.detail?.trim()) patch.detail = args.detail.trim();
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx.auth);
    await requireOwnedDoc(userId, () => ctx.db.get(args.id));
    await ctx.db.delete(args.id);
  },
});
