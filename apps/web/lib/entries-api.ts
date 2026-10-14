// Typed Convex function references without codegen.
//
// The owner generates `convex/_generated/api` on `convex dev`; until then
// components import these references instead of `"entries:…"` string
// literals with `as never` casts. Each reference is built with
// `makeFunctionReference`, so `useQuery`/`useMutation` get real
// `FunctionReference` objects with checked arg/return types.

import { makeFunctionReference } from "convex/server";

import type { DayEntry, EntryType } from "./daystitch";

export type CreateEntryArgs = {
  date: string;
  title: string;
  type: EntryType;
  start?: string;
  end?: string;
  time?: string;
  loc?: string;
  detail?: string;
};

export type UpdateEntryArgs = CreateEntryArgs & {
  id: string;
  /** Task-only; ignored for events. */
  done?: boolean;
};

export const listRangeQuery = makeFunctionReference<
  "query",
  { start: string; end: string },
  DayEntry[]
>("entries:listRange");

export const toggleDoneMutation = makeFunctionReference<
  "mutation",
  { id: string },
  void
>("entries:toggleDone");

export const createEntryMutation = makeFunctionReference<
  "mutation",
  CreateEntryArgs,
  string
>("entries:create");

export const updateEntryMutation = makeFunctionReference<
  "mutation",
  UpdateEntryArgs,
  void
>("entries:update");

export const removeEntryMutation = makeFunctionReference<
  "mutation",
  { id: string },
  void
>("entries:remove");
