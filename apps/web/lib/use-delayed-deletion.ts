"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation } from "convex/react"

import type { Id } from "@/convex/_generated/dataModel"
import type { DayEntry } from "./daystitch"
import { DelayedDeletionManager } from "./delayed-deletion"
import { removeEntryMutation } from "./entries-api"

export function useDelayedDeletion(delayMs = 5000) {
  const remove = useMutation(removeEntryMutation)
  const [pendingEntry, setPendingEntry] = useState<DayEntry | null>(null)
  const managerRef = useRef<DelayedDeletionManager | null>(null)

  if (!managerRef.current) {
    managerRef.current = new DelayedDeletionManager({
      delayMs,
      onExecute: (id) => {
        void remove({ id })
      },
      onStateChange: (entry) => {
        setPendingEntry(entry)
      },
    })
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      managerRef.current?.flush()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      managerRef.current?.flush()
    }
  }, [])

  const stageDelete = useCallback((entry: DayEntry) => {
    managerRef.current?.stage(entry)
  }, [])

  const undoDelete = useCallback(() => {
    managerRef.current?.undo()
  }, [])

  const flushDelete = useCallback(() => {
    managerRef.current?.flush()
  }, [])

  const isPending = useCallback((id: Id<"entries">) => {
    return managerRef.current?.isPending(id) ?? false
  }, [])

  return {
    pendingEntry,
    stageDelete,
    undoDelete,
    flushDelete,
    isPending,
  }
}
