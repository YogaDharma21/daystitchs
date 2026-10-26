import {
  isoDay,
  parseDay,
  sundaysOfMonth,
  daysOfWeek,
  fmtRange,
  entryDraftError,
  assertEntryDraft,
  ENTRY_LIMITS,
} from "../dist/index.js";

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

console.log("All packages/core self-check assertions passed.");
