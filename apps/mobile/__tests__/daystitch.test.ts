import { sundaysOfMonth, daysOfWeek, isoDay } from "@/lib/daystitch";

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
