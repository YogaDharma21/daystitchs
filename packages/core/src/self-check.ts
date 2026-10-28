import {
  isoDay,
  parseDay,
  sundaysOfMonth,
  daysOfWeek,
  fmtRange,
} from "./date.ts";
import {
  entryDraftError,
  assertEntryDraft,
  ENTRY_LIMITS,
} from "./rules.ts";

function assert(condition: boolean, msg?: string): void {
  if (!condition) throw new Error(msg ?? "Assertion failed");
}
assert.equal = (a: unknown, b: unknown, msg?: string): void => {
  if (a !== b) {
    throw new Error(`${msg ? msg + ": " : ""}Expected ${String(a)} === ${String(b)}`);
  }
};
assert.throws = (fn: () => void): void => {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("Expected function to throw");
};

// 1. Invariant: sundaysOfMonth must cover day 1 of month even when month does not start on Sunday.
const octSundays = sundaysOfMonth(2026, 9); // October 2026 (starts on Thursday)
assert(octSundays.length > 0, "October sundays should not be empty");
assert.equal(isoDay(octSundays[0]!), "2026-09-27");

const covered = new Set<number>();
for (const sun of octSundays) {
  for (const d of daysOfWeek(sun)) {
    if (d.getFullYear() === 2026 && d.getMonth() === 9) {
      covered.add(d.getDate());
    }
  }
}
assert.equal(covered.size, 31, "All 31 days in October must be covered");

// 2. Invariant: entryDraftError validation boundaries
assert.equal(
  entryDraftError({ title: "", date: "2026-10-27", type: "task" }),
  "Title is required",
);
assert.equal(
  entryDraftError({ title: "Valid", date: "invalid-date", type: "task" }),
  "Date is required",
);
assert.equal(
  entryDraftError({ title: "Valid", date: "2026-10-27", type: "invalid" }),
  "Unknown entry type",
);
assert.equal(
  entryDraftError({
    title: "a".repeat(ENTRY_LIMITS.title + 1),
    date: "2026-10-27",
    type: "task",
  }),
  "Title is too long",
);
assert.equal(
  entryDraftError({
    title: "Valid",
    date: "2026-10-27",
    type: "task",
    loc: "a".repeat(ENTRY_LIMITS.loc + 1),
  }),
  "Location is too long",
);
assert.equal(
  entryDraftError({
    title: "Valid",
    date: "2026-10-27",
    type: "task",
    detail: "a".repeat(ENTRY_LIMITS.detail + 1),
  }),
  "Detail is too long",
);
assert.equal(
  entryDraftError({ title: "Valid", date: "2026-10-27", type: "task" }),
  null,
);

// 3. Invariant: assertEntryDraft throws on invalid
assert.throws(() =>
  assertEntryDraft({ title: "", date: "2026-10-27", type: "task" }),
);

// 4. Invariant: fmtRange format behavior
assert.equal(fmtRange({ type: "task", time: "14:30" }), "2:30 PM");
assert.equal(fmtRange({ type: "task", time: "09:00" }), "9 AM");
assert.equal(
  fmtRange({ type: "event", start: "09:00", end: "10:00" }),
  "9-10 AM",
);
assert.equal(
  fmtRange({ type: "event", start: "11:30", end: "13:00" }),
  "11:30 AM-1 PM",
);

// 5. Invariant: date round-trip
const parsed = parseDay("2026-10-27");
assert.equal(isoDay(parsed), "2026-10-27");

// 6. Invariant: getNowAndNext logic
import { getNowAndNext } from "./date.ts";
import type { DayEntry } from "./types.ts";

const testDate = new Date(2026, 9, 29, 14, 15); // 2026-10-29 14:15
const testEntries: DayEntry[] = [
  {
    _id: "e1",
    userId: "u1",
    date: "2026-10-29",
    title: "Morning Sync",
    type: "event",
    start: "09:00",
    end: "09:30",
  },
  {
    _id: "e2",
    userId: "u1",
    date: "2026-10-29",
    title: "Architecture Review",
    type: "event",
    start: "14:00",
    end: "15:00",
  },
  {
    _id: "e3",
    userId: "u1",
    date: "2026-10-29",
    title: "Evening Hangout",
    type: "event",
    start: "18:00",
    end: "19:00",
  },
  {
    _id: "t1",
    userId: "u1",
    date: "2026-10-29",
    title: "Morning Task (Done)",
    type: "task",
    time: "09:30",
    done: true,
  },
  {
    _id: "t2",
    userId: "u1",
    date: "2026-10-29",
    title: "Missed Task (Overdue)",
    type: "task",
    time: "11:00",
    done: false,
  },
  {
    _id: "t3",
    userId: "u1",
    date: "2026-10-29",
    title: "Release candidate",
    type: "task",
    time: "14:30",
    done: false,
  },
  {
    _id: "t4",
    userId: "u1",
    date: "2026-10-29",
    title: "Write documentation",
    type: "task",
    done: false,
  },
  {
    _id: "diff_day",
    userId: "u1",
    date: "2026-10-30",
    title: "Tomorrow event",
    type: "event",
    start: "14:00",
    end: "15:00",
  },
];

const res1 = getNowAndNext(testEntries, testDate);
assert.equal(res1.now?._id, "e2", "Active event should be Architecture Review");
assert.equal(res1.next?._id, "t3", "Next task should be upcoming timed task t3");

// When t3 is done, next should pick untimed task t4
testEntries.find((e) => e._id === "t3")!.done = true;
const res2 = getNowAndNext(testEntries, testDate);
assert.equal(res2.next?._id, "t4", "Next task should fall back to untimed t4");

// When t4 is done, next should pick overdue task t2
testEntries.find((e) => e._id === "t4")!.done = true;
const res3 = getNowAndNext(testEntries, testDate);
assert.equal(res3.next?._id, "t2", "Next task should fall back to overdue t2");

// When all tasks are done, next should be null
testEntries.find((e) => e._id === "t2")!.done = true;
const res4 = getNowAndNext(testEntries, testDate);
assert.equal(res4.next, null, "Next task should be null when all tasks done");

// Inactive time window (e.g. 15:30)
const inactiveDate = new Date(2026, 9, 29, 15, 30);
const res5 = getNowAndNext(testEntries, inactiveDate);
assert.equal(res5.now, null, "Active event should be null when outside event times");

console.log("All packages/core self-check assertions passed.");
