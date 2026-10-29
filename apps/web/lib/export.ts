export type ExportEntryItem = {
  id: string
  date: string
  type: "event" | "task"
  title: string
  start?: string
  end?: string
  time?: string
  loc?: string
  detail?: string
  done?: boolean
  createdAt?: number
}

export type ExportPayload = {
  version: 1
  exportedAt: string
  entries: ExportEntryItem[]
}

export function formatExportData(
  entries: Array<{
    _id: string
    _creationTime?: number
    date: string
    type: "event" | "task"
    title: string
    start?: string
    end?: string
    time?: string
    loc?: string
    detail?: string
    done?: boolean
  }>,
  exportedAt = new Date().toISOString()
): ExportPayload {
  return {
    version: 1,
    exportedAt,
    entries: entries.map((e) => ({
      id: e._id,
      date: e.date,
      type: e.type,
      title: e.title,
      ...(e.start ? { start: e.start } : {}),
      ...(e.end ? { end: e.end } : {}),
      ...(e.time ? { time: e.time } : {}),
      ...(e.loc ? { loc: e.loc } : {}),
      ...(e.detail ? { detail: e.detail } : {}),
      ...(e.type === "task" ? { done: Boolean(e.done) } : {}),
      ...(e._creationTime !== undefined ? { createdAt: e._creationTime } : {}),
    })),
  }
}

export function downloadJsonFile(content: string, filename: string): void {
  if (typeof document === "undefined") return
  const blob = new Blob([content], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
