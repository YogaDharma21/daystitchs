export type EntryType = "event" | "task";

export interface DayEntry {
  _id: string;
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

export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(s: string): Date {
  const p = s.split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
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
    ? `${sun.getDate()}–${sat.getDate()} ${ms(sat)}`
    : `${sun.getDate()} ${ms(sun)} – ${sat.getDate()} ${ms(sat)}`;
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

export function fmtRange(e: {
  type: string;
  start?: string;
  end?: string;
  time?: string;
}): string {
  if (e.type === "task") return e.time ? fmtTime(e.time) : "";
  if (e.start && e.end) {
    const a = fmtTime(e.start).split(" ");
    const b = fmtTime(e.end).split(" ");
    return a[1] === b[1]
      ? `${a[0]}–${b[0]} ${b[1]}`
      : `${a.join(" ")}–${b.join(" ")}`;
  }
  return e.start ? fmtTime(e.start) : "";
}

export function sortEntries<T extends { type: string; start?: string; time?: string }>(
  arr: T[],
): T[] {
  const w: Record<string, number> = { event: 0, task: 1 };
  return arr.slice().sort((x, y) => {
    const wx = w[x.type] ?? 0;
    const wy = w[y.type] ?? 0;
    if (wx !== wy) return wx - wy;
    return (x.start || x.time || "") < (y.start || y.time || "") ? -1 : 1;
  });
}

export function monthIndex(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
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

export function sundaysOfMonth(year: number, month: number): Date[] {
  const out: Date[] = [];
  const n = new Date(year, month + 1, 0).getDate();
  for (let s = 1; s <= n; s++) {
    const d = new Date(year, month, s);
    if (d.getDay() !== 0) continue;
    out.push(d);
  }
  return out;
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

export function validateEntryDraft(d: EntryDraft): string | null {
  if (!d.title.trim()) return "Title is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return "Date is required";
  if (d.type !== "event" && d.type !== "task") return "Unknown entry type";
  return null;
}

export function entryDateSummary(d: EntryDraft): string {
  const p = d.date.split("-");
  const dateStr =
    p.length === 3
      ? new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).toLocaleDateString(
          "en-US",
          { weekday: "long", month: "long", day: "numeric" },
        )
      : "Pick a date";
  let t = "";
  if (d.type === "task") t = d.time ? fmtTime(d.time) : "";
  else if (d.start && d.end) t = `${fmtTime(d.start)} – ${fmtTime(d.end)}`;
  else if (d.start) t = fmtTime(d.start);
  return t ? `${dateStr}  ${t}` : dateStr;
}
