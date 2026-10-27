import test from "node:test"
import assert from "node:assert/strict"
import { DelayedDeletionManager } from "./delayed-deletion.ts"

test("DelayedDeletionManager stages deletion and executes after delay", async () => {
  const executed = []
  const manager = new DelayedDeletionManager({
    delayMs: 20,
    onExecute: (id) => executed.push(id),
  })

  const sampleEntry = {
    _id: "entry_1",
    userId: "user_1",
    date: "2026-10-27",
    title: "Test Event",
    type: "event",
  }

  manager.stage(sampleEntry)

  assert.equal(manager.isPending("entry_1"), true)
  assert.equal(manager.getPending(), sampleEntry)
  assert.equal(executed.length, 0)

  await new Promise((resolve) => setTimeout(resolve, 35))

  assert.equal(executed.length, 1)
  assert.equal(executed[0], "entry_1")
  assert.equal(manager.isPending("entry_1"), false)
  assert.equal(manager.getPending(), null)
})

test("DelayedDeletionManager undo cancels timer and does not execute", async () => {
  const executed = []
  const manager = new DelayedDeletionManager({
    delayMs: 30,
    onExecute: (id) => executed.push(id),
  })

  const sampleEntry = {
    _id: "entry_2",
    userId: "user_1",
    date: "2026-10-27",
    title: "Test Task",
    type: "task",
  }

  manager.stage(sampleEntry)
  const undone = manager.undo()

  assert.equal(undone, sampleEntry)
  assert.equal(manager.isPending("entry_2"), false)
  assert.equal(manager.getPending(), null)

  await new Promise((resolve) => setTimeout(resolve, 45))

  assert.equal(executed.length, 0, "onExecute must not be called when undone")
})

test("DelayedDeletionManager flushes previous deletion when staging new one", () => {
  const executed = []
  const manager = new DelayedDeletionManager({
    delayMs: 100,
    onExecute: (id) => executed.push(id),
  })

  const entry1 = { _id: "entry_1", userId: "u1", date: "2026-10-27", title: "1", type: "event" }
  const entry2 = { _id: "entry_2", userId: "u1", date: "2026-10-27", title: "2", type: "task" }

  manager.stage(entry1)
  assert.equal(executed.length, 0)

  manager.stage(entry2)
  assert.equal(executed.length, 1)
  assert.equal(executed[0], "entry_1", "Previous entry must be flushed immediately")
  assert.equal(manager.isPending("entry_2"), true)

  manager.flush()
  assert.equal(executed.length, 2)
  assert.equal(executed[1], "entry_2")
})
