import * as React from "react"
import { cn } from "cn"

export interface SnackbarProps extends React.ComponentProps<"div"> {
  open: boolean
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function Snackbar({
  open,
  message,
  actionLabel,
  onAction,
  className,
  ...props
}: SnackbarProps) {
  if (!open) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-lg backdrop-blur-xs",
        className
      )}
      {...props}
    >
      <span className="text-sm font-medium">{message}</span>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
