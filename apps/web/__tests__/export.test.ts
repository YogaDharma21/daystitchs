import { describe, expect, it, vi } from "vitest"
import { downloadJsonFile, formatExportData } from "@/lib/export"

describe("formatExportData", () => {
  it("formats task and event entries with version envelope", () => {
    const raw = [
      {
        _id: "id_1",
        _creationTime: 1730000000000,
        userId: "user_secret_123",
        date: "2026-10-30",
        type: "task" as const,
        title: "Buy groceries",
        time: "18:00",
        done: true,
        detail: "Apples, milk",
      },
      {
        _id: "id_2",
        _creationTime: 1730000001000,
        userId: "user_secret_123",
        date: "2026-10-30",
        type: "event" as const,
        title: "Sprint Review",
        start: "14:00",
        end: "15:00",
        loc: "Room A",
      },
    ]

    const fixedDate = "2026-10-30T10:00:00.000Z"
    const result = formatExportData(raw, fixedDate)

    expect(result).toEqual({
      version: 1,
      exportedAt: fixedDate,
      entries: [
        {
          id: "id_1",
          date: "2026-10-30",
          type: "task",
          title: "Buy groceries",
          time: "18:00",
          detail: "Apples, milk",
          done: true,
          createdAt: 1730000000000,
        },
        {
          id: "id_2",
          date: "2026-10-30",
          type: "event",
          title: "Sprint Review",
          start: "14:00",
          end: "15:00",
          loc: "Room A",
          createdAt: 1730000001000,
        },
      ],
    })

    // Confirms userId is stripped from export payload for privacy/portability
    expect((result.entries[0] as Record<string, unknown>).userId).toBeUndefined()
  })

  it("handles empty entries list", () => {
    const result = formatExportData([], "2026-10-30T10:00:00.000Z")
    expect(result).toEqual({
      version: 1,
      exportedAt: "2026-10-30T10:00:00.000Z",
      entries: [],
    })
  })
})

describe("downloadJsonFile", () => {
  it("creates blob and clicks link", () => {
    const createObjectURL = vi.fn(() => "blob:mock-url")
    const revokeObjectURL = vi.fn()
    window.URL.createObjectURL = createObjectURL
    window.URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    downloadJsonFile("{}", "export.json")

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")

    clickSpy.mockRestore()
  })
})
