"use client"

import * as React from "react"
import { fmtRange, getNowAndNext, type DayEntry } from "@/lib/daystitch"

interface NowNextBarProps {
  entries: DayEntry[]
  onSelectEntry: (entry: DayEntry) => void
  onToggleDone: (id: DayEntry["_id"]) => void
  nowDate?: Date
}

function useCurrentTime(overrideDate?: Date): Date {
  const [time, setTime] = React.useState<Date>(() => overrideDate ?? new Date())

  React.useEffect(() => {
    if (overrideDate) {
      setTime(overrideDate)
      return
    }
    const timer = setInterval(() => {
      setTime(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [overrideDate])

  return overrideDate ?? time
}

export default function NowNextBar({
  entries,
  onSelectEntry,
  onToggleDone,
  nowDate,
}: NowNextBarProps) {
  const currentNow = useCurrentTime(nowDate)
  const { now, next } = React.useMemo(
    () => getNowAndNext(entries, currentNow),
    [entries, currentNow]
  )

  return (
    <div
      data-testid="now-next-widget"
      className="border-t border-border bg-card/60 px-6 py-2 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1000px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
        {/* NOW item */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-[4px] bg-amber-bg px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] text-amber uppercase">
            Now
          </span>
          {now ? (
            <button
              type="button"
              data-testid="now-entry-btn"
              onClick={() => onSelectEntry(now)}
              className="flex min-w-0 items-center gap-1.5 truncate text-left text-foreground hover:underline active:scale-95 transition-all duration-300 cursor-pointer"
              title={now.title}
            >
              <span className="truncate font-medium">{now.title}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {fmtRange(now)}
              </span>
            </button>
          ) : (
            <span className="text-muted-foreground">Free</span>
          )}
        </div>

        {/* Subtle separator on sm screens */}
        <span
          aria-hidden="true"
          className="hidden sm:inline-block text-border"
        >
          ·
        </span>

        {/* NEXT item */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-[4px] bg-emerald-bg px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] text-emerald uppercase">
            Next
          </span>
          {next ? (
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                data-testid="now-next-toggle-done"
                aria-label={`Mark ${next.title} done`}
                onClick={() => onToggleDone(next._id)}
                className="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border border-border hover:border-foreground/60 active:scale-95 transition-all duration-300 cursor-pointer"
              />
              <button
                type="button"
                data-testid="next-entry-btn"
                onClick={() => onSelectEntry(next)}
                className="flex min-w-0 items-center gap-1.5 truncate text-left text-foreground hover:underline active:scale-95 transition-all duration-300 cursor-pointer"
                title={next.title}
              >
                <span className="truncate font-medium">{next.title}</span>
                {next.time ? (
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {fmtRange(next)}
                  </span>
                ) : null}
              </button>
            </div>
          ) : (
            <span className="text-muted-foreground">No pending tasks</span>
          )}
        </div>
      </div>
    </div>
  )
}
