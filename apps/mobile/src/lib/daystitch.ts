import type { DayEntry } from "@workspace/core";

export {
  type EntryType,
  type DayEntry,
  type MiniCell,
  isoDay,
  parseDay,
  sundayOf,
  weekLabel,
  fmtTime,
  ENTRY_TYPES,
  TYPE_LABEL,
  DETAIL_PLACEHOLDER,
  fmtRange,
  entryCardMeta,
  sortEntries,
  monthIndex,
  titleForYm,
  miniGridCells,
  jumpWindow,
  jumpTarget,
  monthStartDay,
  monthEndDay,
  daysOfWeek,
  sundaysOfMonth,
  type EntryDraft,
  validateEntryDraft,
  entryDateSummary,
} from "@workspace/core";

export type TimelineFilter = "all" | "tasks" | "events" | "pending";

export function filterEntries(
  entries: DayEntry[],
  filter: TimelineFilter
): DayEntry[] {
  if (filter === "all") return entries;
  if (filter === "tasks") return entries.filter((e) => e.type === "task");
  if (filter === "events") return entries.filter((e) => e.type === "event");
  if (filter === "pending") {
    return entries.filter((e) => e.type === "task" && !e.done);
  }
  return entries;
}


