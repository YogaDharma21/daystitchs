"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Command,
  MapPin,
  Search,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { parseDay, fmtTime, type DayEntry } from "@/lib/daystitch"
import { searchEntriesQuery } from "@/lib/entries-api"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectEntry: (entry: DayEntry) => void
}

export default function SearchDialog({
  open,
  onOpenChange,
  onSelectEntry,
}: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedTerm, setDebouncedTerm] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Debounce search input by 150ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 150)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset state when opened/closed
  React.useEffect(() => {
    if (open) {
      setSelectedIndex(0)
      // Give dialog time to mount then focus
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearchTerm("")
      setDebouncedTerm("")
    }
  }, [open])

  const rawResults = useQuery(
    searchEntriesQuery,
    debouncedTerm ? { query: debouncedTerm } : "skip"
  )

  const results: DayEntry[] = React.useMemo(() => {
    if (!debouncedTerm || !rawResults) return []
    return rawResults as DayEntry[]
  }, [debouncedTerm, rawResults])

  // Keep selected index within bounds
  React.useEffect(() => {
    setSelectedIndex((prev) => {
      if (results.length === 0) return 0
      return Math.min(prev, results.length - 1)
    })
  }, [results])

  const handleSelect = React.useCallback(
    (entry: DayEntry) => {
      onSelectEntry(entry)
      onOpenChange(false)
    },
    [onSelectEntry, onOpenChange]
  )

  // Handle keyboard navigation inside the dialog
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const current = results[selectedIndex]
      if (current) {
        handleSelect(current)
      }
    }
  }

  // Scroll active item into view
  React.useEffect(() => {
    if (!listRef.current) return
    const activeItem = listRef.current.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`
    )
    activeItem?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="search-dialog"
        showCloseButton={false}
        className="max-w-xl gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search entries</DialogTitle>
          <DialogDescription>
            Search events and tasks across all dates by title, location, and
            details.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="relative flex items-center border-b px-4 py-3">
          <Search
            aria-hidden="true"
            className="mr-3 size-5 shrink-0 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            data-testid="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search entries (title, details, location)…"
            className="h-auto border-0 p-0 text-base shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
          />
          {searchTerm ? (
            <button
              type="button"
              data-testid="search-clear-btn"
              onClick={() => {
                setSearchTerm("")
                inputRef.current?.focus()
              }}
              className="ml-2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              ESC
            </kbd>
          )}
        </div>

        {/* Results / Empty / Status Area */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Search results"
          className="max-h-[380px] overflow-y-auto p-2"
        >
          {!searchTerm.trim() ? (
            <div
              data-testid="search-prompt"
              className="flex flex-col items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground"
            >
              <Command className="mb-2 size-8 opacity-40" />
              <p className="font-medium text-foreground">Search DayStitch</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Quickly jump to any event or task across your entire timeline.
              </p>
            </div>
          ) : rawResults === undefined ? (
            <div
              data-testid="search-loading"
              className="flex items-center justify-center py-10 text-sm text-muted-foreground"
            >
              <span className="animate-pulse">Searching…</span>
            </div>
          ) : results.length === 0 ? (
            <div
              data-testid="search-no-results"
              className="flex flex-col items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground"
            >
              <p className="font-medium text-foreground">
                No matching entries found
              </p>
              <p className="mt-1 text-xs">
                No events or tasks match &ldquo;{debouncedTerm}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>
              {results.map((entry, index) => {
                const isSelected = index === selectedIndex
                const dateObj = parseDay(entry.date)
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })

                return (
                  <button
                    key={entry._id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    data-testid={`search-result-${entry._id}`}
                    onClick={() => handleSelect(entry)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-secondary text-secondary-foreground"
                        : "text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {entry.type === "task" ? (
                        entry.done ? (
                          <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )
                      ) : (
                        <Calendar className="size-4 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`truncate text-sm font-medium ${
                            entry.done
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {entry.title}
                        </span>
                        <span className="py-0.2 shrink-0 rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                          {entry.type}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{formattedDate}</span>

                        {entry.type === "event" &&
                        (entry.start || entry.end) ? (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {entry.start ? fmtTime(entry.start) : ""}
                            {entry.start && entry.end ? " – " : ""}
                            {entry.end ? fmtTime(entry.end) : ""}
                          </span>
                        ) : null}

                        {entry.type === "task" && entry.time ? (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {fmtTime(entry.time)}
                          </span>
                        ) : null}

                        {entry.loc ? (
                          <span className="flex max-w-[200px] items-center gap-1 truncate">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">{entry.loc}</span>
                          </span>
                        ) : null}
                      </div>

                      {entry.detail ? (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                          {entry.detail}
                        </p>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>{" "}
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              open
            </span>
          </div>
          <span>
            <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>{" "}
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
