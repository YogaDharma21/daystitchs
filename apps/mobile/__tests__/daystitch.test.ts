import {
  sundaysOfMonth,
  daysOfWeek,
  isoDay,
  filterEntries,
  type DayEntry,
  type TimelineFilter,
} from "@/lib/daystitch";

describe("sundaysOfMonth", () => {
  it("includes the Sunday containing the 1st of the month so no days are dropped", () => {
    // October 2026: Oct 1 is Thursday. Sunday containing Oct 1 is Sep 27.
    const sundays = sundaysOfMonth(2026, 9);
    expect(sundays.length).toBeGreaterThan(0);
    expect(isoDay(sundays[0])).toBe("2026-09-27");

    // All days 1..31 must be covered in the week slices
    const coveredDays = new Set<string>();
    for (const sun of sundays) {
      for (const d of daysOfWeek(sun)) {
        if (d.getFullYear() === 2026 && d.getMonth() === 9) {
          coveredDays.add(d.getDate().toString());
        }
      }
    }

    expect(coveredDays.size).toBe(31);
    for (let day = 1; day <= 31; day++) {
      expect(coveredDays.has(day.toString())).toBe(true);
    }
  });

  it("handles months starting on Sunday", () => {
    // February 2026: Feb 1 is Sunday
    const sundays = sundaysOfMonth(2026, 1);
    expect(isoDay(sundays[0])).toBe("2026-02-01");

    const coveredDays = new Set<number>();
    for (const sun of sundays) {
      for (const d of daysOfWeek(sun)) {
        if (d.getFullYear() === 2026 && d.getMonth() === 1) {
          coveredDays.add(d.getDate());
        }
      }
    }
    expect(coveredDays.size).toBe(28);
    for (let day = 1; day <= 28; day++) {
      expect(coveredDays.has(day)).toBe(true);
    }
  });

  it("handles months ending on Sunday", () => {
    // May 2026: May 31 is Sunday
    const sundays = sundaysOfMonth(2026, 4);
    const coveredDays = new Set<number>();
    for (const sun of sundays) {
      for (const d of daysOfWeek(sun)) {
        if (d.getFullYear() === 2026 && d.getMonth() === 4) {
          coveredDays.add(d.getDate());
        }
      }
    }
    expect(coveredDays.size).toBe(31);
    for (let day = 1; day <= 31; day++) {
      expect(coveredDays.has(day)).toBe(true);
    }
  });
});

describe("filterEntries", () => {
  const sampleEntries: DayEntry[] = [
    {
      _id: "e1",
      userId: "u1",
      date: "2026-10-27",
      title: "Team Meeting",
      type: "event",
      start: "10:00",
      end: "11:00",
    },
    {
      _id: "t1",
      userId: "u1",
      date: "2026-10-27",
      title: "Active Task",
      type: "task",
      done: false,
    },
    {
      _id: "t2",
      userId: "u1",
      date: "2026-10-27",
      title: "Done Task",
      type: "task",
      done: true,
    },
  ];

  it("returns all entries when filter is all", () => {
    expect(filterEntries(sampleEntries, "all")).toEqual(sampleEntries);
  });

  it("filters only tasks when filter is tasks", () => {
    const result = filterEntries(sampleEntries, "tasks");
    expect(result.map((e) => e._id)).toEqual(["t1", "t2"]);
  });

  it("filters only events when filter is events", () => {
    const result = filterEntries(sampleEntries, "events");
    expect(result.map((e) => e._id)).toEqual(["e1"]);
  });

  it("filters only uncompleted tasks when filter is pending", () => {
    const result = filterEntries(sampleEntries, "pending");
    expect(result.map((e) => e._id)).toEqual(["t1"]);
  });

  it("returns empty array when input is empty", () => {
    expect(filterEntries([], "all")).toEqual([]);
    expect(filterEntries([], "pending")).toEqual([]);
  });
});
