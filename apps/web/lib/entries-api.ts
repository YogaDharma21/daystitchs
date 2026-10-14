// Convex function references from codegen.
//
// Components import these instead of reaching into `_generated/api`
// directly, keeping one place that names the data seam. Arg and return
// types come from the function validators in convex/entries.ts.

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import type { EntryType } from "./daystitch";

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
  id: Id<"entries">;
  /** Task-only; ignored for events. */
  done?: boolean;
};

export const listRangeQuery = api.entries.listRange;
export const toggleDoneMutation = api.entries.toggleDone;
export const createEntryMutation = api.entries.create;
export const updateEntryMutation = api.entries.update;
export const removeEntryMutation = api.entries.remove;
