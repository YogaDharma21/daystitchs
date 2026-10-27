import type { DayEntry } from "./daystitch"
import type { Id } from "@/convex/_generated/dataModel"

export interface DelayedDeletionOptions {
  delayMs?: number
  onExecute: (id: Id<"entries">) => void | Promise<unknown>
  onStateChange?: (entry: DayEntry | null) => void
}

export class DelayedDeletionManager {
  private pending: DayEntry | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private delayMs: number
  private onExecute: (id: Id<"entries">) => void | Promise<unknown>
  private onStateChange?: (entry: DayEntry | null) => void

  constructor(options: DelayedDeletionOptions) {
    this.delayMs = options.delayMs ?? 5000
    this.onExecute = options.onExecute
    this.onStateChange = options.onStateChange
  }

  getPending(): DayEntry | null {
    return this.pending
  }

  isPending(id: string): boolean {
    return this.pending?._id === id
  }

  stage(entry: DayEntry): void {
    this.flush()

    this.pending = entry
    this.onStateChange?.(this.pending)

    this.timer = setTimeout(() => {
      this.flush()
    }, this.delayMs)
  }

  undo(): DayEntry | null {
    if (!this.pending) return null
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    const restored = this.pending
    this.pending = null
    this.onStateChange?.(null)
    return restored
  }

  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.pending) {
      const entry = this.pending
      this.pending = null
      this.onStateChange?.(null)
      this.onExecute(entry._id)
    }
  }

  destroy(): void {
    this.flush()
  }
}
