import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useQuery } from "convex/react"
import SearchDialog from "@/components/search-dialog"
import type { DayEntry } from "@/lib/daystitch"

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}))

describe("SearchDialog component", () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSelectEntry = vi.fn()

  const mockResults: DayEntry[] = [
    {
      _id: "e1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-27",
      title: "Sprint Planning",
      type: "event",
      start: "10:00",
      end: "11:00",
      loc: "Room A",
    },
    {
      _id: "t1" as DayEntry["_id"],
      userId: "u1",
      date: "2026-10-28",
      title: "Review PR",
      type: "task",
      time: "14:00",
      done: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders search prompt when query is empty", () => {
    vi.mocked(useQuery).mockReturnValue(undefined)

    render(
      <SearchDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelectEntry={mockOnSelectEntry}
      />
    )

    expect(screen.getByTestId("search-dialog")).toBeInTheDocument()
    expect(screen.getByTestId("search-prompt")).toBeInTheDocument()
    expect(screen.getByText("Search DayStitch")).toBeInTheDocument()
  })

  it("displays search results after debounced input", () => {
    vi.mocked(useQuery).mockImplementation((_query: any, args?: any) => {
      if (args && typeof args === "object" && "query" in args) {
        return mockResults
      }
      return undefined
    })

    render(
      <SearchDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelectEntry={mockOnSelectEntry}
      />
    )

    const input = screen.getByTestId("search-input")
    fireEvent.change(input, { target: { value: "plan" } })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByText("Sprint Planning")).toBeInTheDocument()
    expect(screen.getByText("Review PR")).toBeInTheDocument()
  })

  it("selects an entry on click, closes dialog, and invokes callback", () => {
    vi.mocked(useQuery).mockReturnValue(mockResults)

    render(
      <SearchDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelectEntry={mockOnSelectEntry}
      />
    )

    const input = screen.getByTestId("search-input")
    fireEvent.change(input, { target: { value: "Sprint" } })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    const resultItem = screen.getByTestId("search-result-e1")
    fireEvent.click(resultItem)

    expect(mockOnSelectEntry).toHaveBeenCalledWith(mockResults[0])
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it("displays no results message when query returns empty array", () => {
    vi.mocked(useQuery).mockReturnValue([])

    render(
      <SearchDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelectEntry={mockOnSelectEntry}
      />
    )

    const input = screen.getByTestId("search-input")
    fireEvent.change(input, { target: { value: "nonexistent" } })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByTestId("search-no-results")).toBeInTheDocument()
    expect(screen.getByText("No matching entries found")).toBeInTheDocument()
  })
})
