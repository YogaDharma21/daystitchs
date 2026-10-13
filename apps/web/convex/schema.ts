import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  entries: defineTable({
    userId: v.string(),
    date: v.string(),
    title: v.string(),
    type: v.union(v.literal("event"), v.literal("task")),
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    time: v.optional(v.string()),
    loc: v.optional(v.string()),
    detail: v.optional(v.string()),
    done: v.optional(v.boolean()),
  }).index("by_user_date", ["userId", "date"]),
});
