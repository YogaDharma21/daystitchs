export type EntryType = "event" | "task";

export const ENTRY_TYPES: EntryType[] = ["task", "event"];

export const TYPE_LABEL: Record<EntryType, string> = {
  task: "Task",
  event: "Event",
};

export const DETAIL_PLACEHOLDER: Record<EntryType, string> = {
  task: "e.g. Bring slides",
  event: "e.g. Agenda, links, notes",
};

export interface DayEntry<TId = string> {
  _id: TId;
  userId: string;
  date: string;
  title: string;
  type: EntryType;
  start?: string;
  end?: string;
  time?: string;
  loc?: string;
  detail?: string;
  done?: boolean;
}

export interface EntryDraft {
  title: string;
  date: string;
  type: EntryType;
  start?: string;
  end?: string;
  time?: string;
  loc?: string;
  detail?: string;
}

export interface MiniCell {
  key: string | null;
  day: number | null;
  isToday: boolean;
}

export interface NowAndNextResult<TId = string> {
  now: DayEntry<TId> | null;
  next: DayEntry<TId> | null;
}
