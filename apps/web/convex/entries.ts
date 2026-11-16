import { mutation, query } from "./_generated/server"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { v } from "convex/values"
import type { Doc, Id } from "./_generated/dataModel"

import { assertEntryDraft } from "./entryRules"

type CtxAuth = QueryCtx["auth"] | MutationCtx["auth"]

// tokenIdentifier is the canonical stable identity key: it binds the Clerk
// issuer to the user, so tokens from another instance can never collide.
async function callerUserId(auth: CtxAuth): Promise<string | null> {
  const identity = await auth.getUserIdentity()
  return identity?.tokenIdentifier ?? null
}

async function requireUserId(auth: CtxAuth): Promise<string> {
  const userId = await callerUserId(auth)
  if (!userId) throw new Error("Not signed in")
  return userId
}

async function requireOwnedDoc(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  id: Id<"entries">
): Promise<Doc<"entries">> {
  const doc = await ctx.db.get(id)
  if (!doc || doc.userId !== userId) throw new Error("Entry not found")
  return doc
}

export const listRange = query({
  args: { start: v.string(), end: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx.auth)
    if (!userId) return []
    return await ctx.db
      .query("entries")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", userId).gte("date", args.start).lte("date", args.end)
      )
      .order("asc")
      .take(5000)
  },
})

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await callerUserId(ctx.auth)
    const q = args.query.trim()
    if (!userId || !q) return []

    const [titleHits, detailHits, locHits] = await Promise.all([
      ctx.db
        .query("entries")
        .withSearchIndex("search_title", (builder) =>
          builder.search("title", q).eq("userId", userId)
        )
        .take(20),
      ctx.db
        .query("entries")
        .withSearchIndex("search_detail", (builder) =>
          builder.search("detail", q).eq("userId", userId)
        )
        .take(20),
      ctx.db
        .query("entries")
        .withSearchIndex("search_loc", (builder) =>
          builder.search("loc", q).eq("userId", userId)
        )
        .take(20),
    ])

    const seen = new Set<string>()
    const results: Doc<"entries">[] = []
    for (const item of [...titleHits, ...detailHits, ...locHits]) {
      if (!seen.has(item._id)) {
        seen.add(item._id)
        results.push(item)
      }
    }

    return results.sort((a, b) => b.date.localeCompare(a.date))
  },
})

export const toggleDone = mutation({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx.auth)
    const doc = await requireOwnedDoc(ctx, userId, args.id)
    if (doc.type !== "task") throw new Error("Only tasks track done")
    await ctx.db.patch(args.id, { done: !doc.done })
  },
})

const dateRule = v.string()
const titleRule = v.string()
const typeRule = v.union(v.literal("event"), v.literal("task"))

export const create = mutation({
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
    const userId = await requireUserId(ctx.auth)
    // Rejects overlong title/loc/detail with an error (no silent truncation).
    assertEntryDraft(args)
    const doc: {
      userId: string
      date: string
      title: string
      type: "event" | "task"
      start?: string
      end?: string
      time?: string
      loc?: string
      detail?: string
      done?: boolean
    } = {
      userId,
      date: args.date,
      title: args.title.trim(),
      type: args.type,
    }
    if (args.type === "event") {
      if (args.start) doc.start = args.start
      if (args.end) doc.end = args.end
      if (args.loc?.trim()) doc.loc = args.loc.trim()
    } else {
      if (args.time) doc.time = args.time
      doc.done = false
    }
    if (args.detail?.trim()) doc.detail = args.detail.trim()
    return await ctx.db.insert("entries", doc)
  },
})

export const update = mutation({
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
    const userId = await requireUserId(ctx.auth)
    const doc = await requireOwnedDoc(ctx, userId, args.id)
    assertEntryDraft(args)
    const nextDoc: {
      userId: string
      date: string
      title: string
      type: "event" | "task"
      start?: string
      end?: string
      time?: string
      loc?: string
      detail?: string
      done?: boolean
    } = {
      userId: doc.userId,
      date: args.date,
      title: args.title.trim(),
      type: args.type,
    }
    if (args.type === "event") {
      if (args.start?.trim()) nextDoc.start = args.start.trim()
      if (args.end?.trim()) nextDoc.end = args.end.trim()
      if (args.loc?.trim()) nextDoc.loc = args.loc.trim()
    } else {
      if (args.time?.trim()) nextDoc.time = args.time.trim()
      nextDoc.done = args.done ?? (doc.type === "task" ? doc.done : false) ?? false
    }
    if (args.detail?.trim()) nextDoc.detail = args.detail.trim()
    await ctx.db.replace(args.id, nextDoc)
  },
})

export const remove = mutation({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx.auth)
    await requireOwnedDoc(ctx, userId, args.id)
    await ctx.db.delete(args.id)
  },
})
