import type { EntryDraft } from "./types";

export const ENTRY_LIMITS = {
  title: 80,
  loc: 60,
  detail: 120,
} as const;

export interface EntryDraftInput {
  title: string;
  date: string;
  type: string;
  loc?: string;
  detail?: string;
}

export function entryDraftError(d: EntryDraftInput): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return "Date is required";
  const title = d.title.trim();
  if (!title) return "Title is required";
  if (title.length > ENTRY_LIMITS.title) return "Title is too long";
  if (d.type !== "event" && d.type !== "task") return "Unknown entry type";
  if (d.loc !== undefined && d.loc.trim().length > ENTRY_LIMITS.loc)
    return "Location is too long";
  if (d.detail !== undefined && d.detail.trim().length > ENTRY_LIMITS.detail)
    return "Detail is too long";
  return null;
}

export function assertEntryDraft(d: EntryDraftInput): void {
  const error = entryDraftError(d);
  if (error) throw new Error(error);
}

export function validateEntryDraft(d: EntryDraft): string | null {
  return entryDraftError(d);
}
