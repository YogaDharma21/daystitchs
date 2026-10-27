import type { Id } from "@/convex/_generated/dataModel";
import type { DayEntry as CoreDayEntry } from "@workspace/core";

export type DayEntry = CoreDayEntry<Id<"entries">>;

export {
  type EntryType,
  ENTRY_TYPES,
  TYPE_LABEL,
  DETAIL_PLACEHOLDER,
  type MiniCell,
  type EntryDraft,
  type EntryDraftInput,
  ENTRY_LIMITS,
  entryDraftError,
  assertEntryDraft,
  isoDay,
  parseDay,
  sundayOf,
  weekLabel,
  fmtTime,
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
  validateEntryDraft,
  entryDateSummary,
} from "@workspace/core";
