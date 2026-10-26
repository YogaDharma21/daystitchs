import type { EntryDraft, EntryType, MiniCell } from "./types.js";

export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(s: string): Date {
  const parts = s.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

export function sundayOf(d: Date): Date {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() - t.getDay());
  return t;
}

export function weekLabel(sun: Date): string {
  const sat = new Date(sun);
  sat.setDate(sat.getDate() + 6);
  const ms = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short" });
  return sun.getMonth() === sat.getMonth()
    ? `${sun.getDate()}-${sat.getDate()} ${ms(sat)}`
    : `${sun.getDate()} ${ms(sun)} - ${sat.getDate()} ${ms(sat)}`;
}

export function fmtTime(hhmm: string): string {
  if (!hhmm) return "";
  const p = hhmm.split(":");
  const h = Number(p[0]);
  const m = p[1];
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === "00" ? `${h12} ${ap}` : `${h12}:${m} ${ap}`;
}

interface RangeFields {
  start?: string;
  end?: string;
  time?: string;
}

function taskRangeText(e: RangeFields): string {
  return e.time ? fmtTime(e.time) : "";
}

function eventRangeText(e: RangeFields, sep = "-"): string {
  if (e.start && e.end) {
    const a = fmtTime(e.start).split(" ");
    const b = fmtTime(e.end).split(" ");
    return a[1] === b[1]
      ? `${a[0]}${sep}${b[0]} ${b[1]}`
      : `${a.join(" ")}${sep}${b.join(" ")}`;
  }
  return e.start ? fmtTime(e.start) : "";
}

const RANGE_TEXT_BY_TYPE: Record<
  EntryType,
  (e: RangeFields, sep?: string) => string
> = {
  task: taskRangeText,
  event: eventRangeText,
};

export function fmtRange(e: {
  type: string;
  start?: string;
  end?: string;
  time?: string;
}): string {
  if (e.type !== "task" && e.type !== "event") {
    return e.start ? fmtTime(e.start) : "";
  }
  return RANGE_TEXT_BY_TYPE[e.type](e);
}

/** Join card sub-line parts (time range, location, detail), skipping blanks. */
export function entryCardMeta(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}

export function sortEntries<T extends { type: string; start?: string; time?: string }>(
  arr: T[],
): T[] {
  const typeWeight: Record<string, number> = { event: 0, task: 1 };
  return arr.slice().sort((x, y) => {
    const xWeight = typeWeight[x.type] ?? 0;
    const yWeight = typeWeight[y.type] ?? 0;
    if (xWeight !== yWeight) return xWeight - yWeight;
    const xKey = x.start || x.time || "";
    const yKey = y.start || y.time || "";
    if (xKey === yKey) return 0;
    return xKey < yKey ? -1 : 1;
  });
}

export function monthIndex(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
}

export function titleForYm(ym: string): string {
  const p = ym.split("-");
  return new Date(Number(p[0]), Number(p[1]), 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function miniGridCells(
  year: number,
  month: number,
  todayKey: string,
): MiniCell[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const n = new Date(year, month + 1, 0).getDate();
  const out: MiniCell[] = [];
  for (let b = 0; b < offset; b++)
    out.push({ key: null, day: null, isToday: false });
  for (let d = 1; d <= n; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    out.push({ key, day: d, isToday: key === todayKey });
  }
  return out;
}

export function jumpWindow(
  w: { start: number; end: number },
  idx: number,
): { start: number; end: number } {
  if (idx >= w.start && idx <= w.end) return w;
  return { start: idx - 1, end: idx + 1 };
}

export function jumpTarget(dateKey: string): { idx: number; sunKey: string } {
  const d = parseDay(dateKey);
  return { idx: monthIndex(d), sunKey: isoDay(sundayOf(d)) };
}

export function monthStartDay(idx: number): string {
  const y = Math.floor(idx / 12);
  const m = idx % 12;
  return `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

export function monthEndDay(idx: number): string {
  const y = Math.floor(idx / 12);
  const m = idx % 12;
  const n = new Date(y, m + 1, 0).getDate();
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
}

export function daysOfWeek(sun: Date): Date[] {
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    out.push(d);
  }
  return out;
}

// ponytail: basic linear week-stride, upgrade to memoized generator if large date range rendering lags.
export function sundaysOfMonth(year: number, month: number): Date[] {
  const out: Date[] = [];
  const firstSun = sundayOf(new Date(year, month, 1));
  const lastDay = new Date(year, month + 1, 0);
  const cur = new Date(firstSun);
  while (cur <= lastDay) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return out;
}

export function entryDateSummary(d: EntryDraft): string {
  const parts = d.date.split("-");
  const dateStr =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString(
          "en-US",
          { weekday: "long", month: "long", day: "numeric" },
        )
      : "Pick a date";
  const t = RANGE_TEXT_BY_TYPE[d.type](d, " - ");
  return t ? `${dateStr}  ${t}` : dateStr;
}
