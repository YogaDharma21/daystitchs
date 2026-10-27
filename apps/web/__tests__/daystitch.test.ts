import { describe, expect, it } from "vitest"
import {
  fmtRange,
  isoDay,
  parseDay,
  sortEntries,
  sundaysOfMonth,
  type DayEntry,
} from "@/lib/daystitch"

describe("daystitch lib", () => {
  it("formats and parses ISO dates symmetrically", () => {
    const d = new Date(2026, 9, 27)
    const s = isoDay(d)
    expect(s).toBe("2026-10-27")
    const parsed = parseDay(s)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(9)
    expect(parsed.getDate()).toBe(27)
  })

  it("sundaysOfMonth returns all Sundays in the given month", () => {
    const sundays = sundaysOfMonth(2026, 9)
    expect(sundays.length).toBe(4)
    for (const sun of sundays) {
      expect(sun.getDay()).toBe(0)
      expect(sun.getMonth()).toBe(9)
      expect(sun.getFullYear()).toBe(2026)
    }
  })

  it("fmtRange formats event range and task time correctly", () => {
    const event: DayEntry = {
      _id: "e1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-27",
      title: "Meeting",
      type: "event",
      start: "09:00",
      end: "10:30",
    }
    expect(fmtRange(event)).toBe("9–10:30 AM")

    const task: DayEntry = {
      _id: "t1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-27",
      title: "Write tests",
      type: "task",
      time: "14:00",
    }
    expect(fmtRange(task)).toBe("2 PM")
  })

  it("sortEntries sorts events before tasks and then by time", () => {
    const entries: DayEntry[] = [
      {
        _id: "t2" as DayEntry["_id"],
        userId: "u1",
        date: "2026-10-27",
        title: "Later Task",
        type: "task",
        time: "11:00",
        done: false,
      },
      {
        _id: "t1" as DayEntry["_id"],
        userId: "u1",
        date: "2026-10-27",
        title: "Earlier Task",
        type: "task",
        time: "08:00",
        done: true,
      },
      {
        _id: "e1" as DayEntry["_id"],
        userId: "u1",
        date: "2026-10-27",
        title: "Event",
        type: "event",
        start: "10:00",
        end: "11:00",
      },
    ]

    const sorted = sortEntries(entries)
    expect(sorted.map((e) => e._id)).toEqual(["e1", "t1", "t2"])
  })
})
