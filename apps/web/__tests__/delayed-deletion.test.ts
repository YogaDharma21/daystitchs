import { describe, expect, it } from "vitest"
import { DelayedDeletionManager } from "@/lib/delayed-deletion"
import type { DayEntry } from "@/lib/daystitch"

describe("DelayedDeletionManager", () => {
  it("stages deletion and executes after delay", async () => {
    const executed: string[] = []
    const manager = new DelayedDeletionManager({
      delayMs: 20,
      onExecute: (id) => {
        executed.push(id)
      },
    })

    const sampleEntry: DayEntry = {
      _id: "entry_1" as DayEntry["_id"],
      userId: "user_1",
      date: "2026-10-27",
      title: "Test Event",
      type: "event",
    }

    manager.stage(sampleEntry)

    expect(manager.isPending("entry_1")).toBe(true)
    expect(manager.getPending()).toEqual(sampleEntry)
    expect(executed.length).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 35))

    expect(executed.length).toBe(1)
    expect(executed[0]).toBe("entry_1")
    expect(manager.isPending("entry_1")).toBe(false)
    expect(manager.getPending()).toBeNull()
  })

  it("undo cancels timer and does not execute", async () => {
    const executed: string[] = []
    const manager = new DelayedDeletionManager({
      delayMs: 30,
      onExecute: (id) => {
        executed.push(id)
      },
    })

    const sampleEntry: DayEntry = {
      _id: "entry_2" as DayEntry["_id"],
      userId: "user_1",
      date: "2026-10-27",
      title: "Test Task",
      type: "task",
    }

    manager.stage(sampleEntry)
    const undone = manager.undo()

    expect(undone).toEqual(sampleEntry)
    expect(manager.isPending("entry_2")).toBe(false)
    expect(manager.getPending()).toBeNull()

    await new Promise((resolve) => setTimeout(resolve, 45))

    expect(executed.length).toBe(0)
  })

  it("flushes previous deletion when staging new one", () => {
    const executed: string[] = []
    const manager = new DelayedDeletionManager({
      delayMs: 100,
      onExecute: (id) => {
        executed.push(id)
      },
    })

    const entry1: DayEntry = {
      _id: "entry_1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-27",
      title: "1",
      type: "event",
    }
    const entry2: DayEntry = {
      _id: "entry_2" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-27",
      title: "2",
      type: "task",
    }

    manager.stage(entry1)
    expect(executed.length).toBe(0)

    manager.stage(entry2)
    expect(executed.length).toBe(1)
    expect(executed[0]).toBe("entry_1")
    expect(manager.isPending("entry_2")).toBe(true)

    manager.flush()
    expect(executed.length).toBe(2)
    expect(executed[1]).toBe("entry_2")
  })
})
