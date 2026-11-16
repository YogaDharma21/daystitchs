import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NowNextBar from "@/components/now-next-bar"
import type { DayEntry } from "@/lib/daystitch"

describe("NowNextBar component", () => {
  const onSelectEntry = vi.fn()
  const onToggleDone = vi.fn()

  const testDate = new Date(2026, 9, 29, 14, 15) // 14:15 on Oct 29, 2026

  const mockEntries: DayEntry[] = [
    {
      _id: "e1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-29",
      title: "Sprint Planning",
      type: "event",
      start: "14:00",
      end: "15:00",
      loc: "Zoom",
    },
    {
      _id: "t1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-29",
      title: "Deploy build",
      type: "task",
      time: "14:45",
      done: false,
    },
  ]

  it("renders active event and immediate next task with correct data", () => {
    render(
      <NowNextBar
        entries={mockEntries}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    )

    expect(screen.getByTestId("now-next-widget")).toBeInTheDocument()
    expect(screen.getByText("Sprint Planning")).toBeInTheDocument()
    expect(screen.getByText("Deploy build")).toBeInTheDocument()
  })

  it("calls onSelectEntry when clicking now or next item", () => {
    render(
      <NowNextBar
        entries={mockEntries}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    )

    fireEvent.click(screen.getByTestId("now-entry-btn"))
    expect(onSelectEntry).toHaveBeenCalledWith(mockEntries[0])

    fireEvent.click(screen.getByTestId("next-entry-btn"))
    expect(onSelectEntry).toHaveBeenCalledWith(mockEntries[1])
  })

  it("calls onToggleDone when clicking the checkbox on next task", () => {
    render(
      <NowNextBar
        entries={mockEntries}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    )

    fireEvent.click(screen.getByTestId("now-next-toggle-done"))
    expect(onToggleDone).toHaveBeenCalledWith("t1")
  })

  it("renders idle states when no events are active and no tasks are pending", () => {
    render(
      <NowNextBar
        entries={[]}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    )

    expect(screen.getByText("Free")).toBeInTheDocument()
    expect(screen.getByText("No pending tasks")).toBeInTheDocument()
  })
})
