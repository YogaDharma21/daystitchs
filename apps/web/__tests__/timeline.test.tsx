import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { useQuery } from "convex/react"
import Timeline from "@/components/timeline"
import { isoDay, type DayEntry } from "@/lib/daystitch"

const mockToggleDone = vi.fn()
const mockUseMutation = vi.fn()

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: (mutation: unknown) => mockUseMutation(mutation),
}))

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe("Timeline web component", () => {
  const originalEnv = process.env.NEXT_PUBLIC_CONVEX_URL

  const today = new Date()
  const todayKey = isoDay(today)
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  )
  const tomorrowKey = isoDay(tomorrow)

  const mockEntries: DayEntry[] = [
    {
      _id: "t1" as DayEntry["_id"],
      userId: "user_1",
      date: todayKey,
      title: "Submit PR",
      type: "task",
      time: "08:00",
      detail: "Follow TDD",
      done: false,
    },
    {
      _id: "e1" as DayEntry["_id"],
      userId: "user_1",
      date: todayKey,
      title: "Design Review",
      type: "event",
      start: "10:00",
      end: "11:30",
      loc: "Room 101",
      detail: "Review specs",
    },
    {
      _id: "t2" as DayEntry["_id"],
      userId: "user_1",
      date: tomorrowKey,
      title: "Write documentation",
      type: "task",
      time: "16:00",
      detail: "Architecture notes",
      done: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud"

    mockUseMutation.mockImplementation(() => mockToggleDone)
    vi.mocked(useQuery).mockReturnValue(mockEntries)
    mockToggleDone.mockResolvedValue(undefined)
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_CONVEX_URL = originalEnv
  })

  it("renders missing env message when NEXT_PUBLIC_CONVEX_URL is absent", () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = ""
    render(<Timeline />)
    expect(screen.getByTestId("timeline-missing")).toBeInTheDocument()
  })

  it("renders timeline with entries and items", () => {
    render(<Timeline />)

    expect(screen.getByTestId("timeline")).toBeInTheDocument()
    expect(screen.getByTestId("now-next-widget")).toBeInTheDocument()
    expect(screen.getAllByText("Submit PR").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Design Review")).toBeInTheDocument()
    expect(screen.getByText("Write documentation")).toBeInTheDocument()
  })

  it("toggles task done status when clicking toggle button", () => {
    render(<Timeline />)

    const toggleButton = screen.getByLabelText("Toggle done for Submit PR")
    expect(toggleButton).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(toggleButton)

    expect(mockToggleDone).toHaveBeenCalledWith({ id: "t1" })
  })

  it("opens entry sheet when clicking an entry card", async () => {
    render(<Timeline />)

    const taskCards = screen.getAllByTestId("task-card")
    expect(taskCards.length).toBeGreaterThan(0)

    fireEvent.click(taskCards[0]!)

    await waitFor(() => {
      expect(screen.getByTestId("entry-sheet")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Submit PR")).toBeInTheDocument()
    })
  })

  it("renders empty timeline state when entries list is empty", () => {
    vi.mocked(useQuery).mockReturnValue([])
    render(<Timeline />)

    expect(screen.getByTestId("timeline-empty")).toBeInTheDocument()
    expect(screen.getByText("No entries yet")).toBeInTheDocument()
  })
})
