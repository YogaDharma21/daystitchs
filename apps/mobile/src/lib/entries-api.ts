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
  done?: boolean;
};

export const listRangeQuery = makeFunctionReference<
  "query",
  { start: string; end: string },
  DayEntry[]
>("entries:listRange");

export const searchEntriesQuery = makeFunctionReference<
  "query",
  { query: string },
  DayEntry[]
>("entries:search");

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
