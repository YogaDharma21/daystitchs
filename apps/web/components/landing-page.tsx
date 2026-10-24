"use client"

import * as React from "react"
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Info,
  Lock,
  MapPin,
  Plus,
  User,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "cn"

interface LandingPageProps {
  signInTrigger?: React.ReactNode
  heroSignInTrigger?: React.ReactNode
  isConfigMissing?: boolean
}

export default function LandingPage({
  signInTrigger,
  heroSignInTrigger,
  isConfigMissing = false,
}: LandingPageProps) {
  const [showConfigModal, setShowConfigModal] = React.useState(false)

  // Interactive mockup tasks state so the user can interactively toggle them
  const [tasks, setTasks] = React.useState([
    {
      id: "t1",
      title: "Review Q4 product roadmap & timeline",
      time: "9:00 AM",
      loc: "Studio",
      type: "task" as const,
      done: true,
    },
    {
      id: "e1",
      title: "Design architecture review",
      time: "11:00 AM – 12:30 PM",
      loc: "Design Room 4B",
      type: "event" as const,
      done: false,
    },
    {
      id: "t2",
      title: "Ship DayStitch release update",
      time: "2:15 PM",
      loc: "Workspace",
      type: "task" as const,
      done: false,
    },
    {
      id: "t3",
      title: "Evening run & reflection note",
      time: "6:30 PM",
      loc: "Park Loop",
      type: "task" as const,
      done: false,
    },
  ])

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const handleFallbackClick = () => {
    if (isConfigMissing) {
      setShowConfigModal(true)
    }
  }

  const defaultSignInButton = (
    <Button
      size="lg"
      onClick={handleFallbackClick}
      className="group flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium shadow-md shadow-primary/20 transition-all hover:shadow-primary/30"
    >
      <span>Sign in</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Button>
  )

  const defaultHeroSignInButton = (
    <Button
      size="lg"
      onClick={handleFallbackClick}
      className="group flex h-12 items-center gap-2.5 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/35 active:scale-[0.98]"
    >
      <span>Start Stitching Your Days</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Button>
  )

  const headerAction = signInTrigger || defaultSignInButton
  const heroAction =
    heroSignInTrigger || signInTrigger || defaultHeroSignInButton

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Background ambient lighting and subtle stitch grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />
      </div>

      {/* Missing configuration notice banner if keys are not set */}
      {isConfigMissing && (
        <div className="flex items-center justify-center gap-2 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-center text-xs text-yellow-200/90">
          <Info className="size-3.5 flex-none" />
          <span>
            <strong>Dev Mode:</strong> Add{" "}
            <code className="rounded bg-yellow-500/20 px-1 py-0.5 font-mono text-[11px]">
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-yellow-500/20 px-1 py-0.5 font-mono text-[11px]">
              NEXT_PUBLIC_CONVEX_URL
            </code>{" "}
            to enable live authentication.
          </span>
        </div>
      )}

      {/* Config Missing Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                <Info className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Setup Required</h3>
                <p className="text-xs text-muted-foreground">
                  Authentication configuration
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              To connect Clerk and Convex, provide the following environment
              variables in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                apps/web/.env.local
              </code>
              :
            </p>
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/60 p-3 font-mono text-xs text-muted-foreground">
              <div className="text-foreground">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
              </div>
              <div className="text-foreground">
                NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfigModal(false)}
                className="rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="DayStitch"
              className="size-8 rounded-lg shadow-xs"
            />
            <span className="text-lg font-semibold tracking-tight text-foreground">DayStitch</span>
          </div>

          <div className="flex items-center gap-3">{headerAction}</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-14 sm:pt-28 sm:pb-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Hero title */}
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Stitch your days together,{" "}
            <span className="mt-1 block text-muted-foreground sm:mt-2">
              without the clutter.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Calendars isolate your schedule into fragmented boxes. Todo lists
            lose time context. DayStitch weaves your tasks, events, and focus
            into one continuous stream.
          </p>

          {/* Primary Action CTA */}
          <div className="mt-8 flex justify-center">{heroAction}</div>
        </div>
      </section>

      {/* Timeline Preview Showcase */}
      <section className="px-6 pb-20 sm:pb-28">
        <div className="mx-auto max-w-4xl">
          {/* App Window Frame Mockup */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_28px_56px_-40px_rgba(0,0,0,0.9)]">
            {/* Native Window Titlebar */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-surface px-4 py-2.5">
              {/* Traffic light window controls */}
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full border border-mineral-crimson/50 bg-mineral-crimson/80" />
                <span className="size-3 rounded-full border border-mineral-amber/50 bg-mineral-amber/80" />
                <span className="size-3 rounded-full border border-mineral-emerald/50 bg-mineral-emerald/80" />
              </div>

              {/* Centered clean browser address pill */}
              <div className="flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 font-mono text-xs text-muted-foreground">
                <Lock className="size-3 text-muted-foreground/60" />
                <span>daystitch.app</span>
              </div>

              {/* Right empty spacer for balance */}
              <div className="flex justify-end" />
            </div>

            {/* In-app sticky header mockup matching real DayStitch shell */}
            <div className="flex items-center justify-between border-b border-border bg-background/80 px-6 py-3">
              <div className="flex items-center gap-1 text-sm font-semibold tracking-tight text-foreground">
                <span>October 2026</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-foreground shadow-xs">
                  <CalendarDays className="size-3.5 text-foreground" />
                  <span>Today</span>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
                  <User className="size-4" />
                </div>
              </div>
            </div>

            {/* Inner Timeline Content */}
            <div className="space-y-6 p-4 sm:p-8">
              {/* Month Banner */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 text-card-foreground">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-8xl font-bold tabular-nums text-foreground/[0.04] select-none"
                >
                  10
                </span>
                <p className="relative text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase tabular-nums">
                  2026 · 4 entries
                </p>
                <div className="relative mt-1 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    October
                  </h3>
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Jump to Month</span>
                  </div>
                </div>
              </div>

              {/* Day Row with Continuous Stitch Line */}
              <div className="relative grid grid-cols-[44px_1fr] gap-3">
                {/* Continuous vertical stitch line */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 bottom-0 left-[22px] w-px bg-border-subtle"
                />

                {/* Day Marker */}
                <div className="relative z-[1] flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Wed
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-xs">
                    22
                  </div>
                </div>

                {/* Day Entries List */}
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Wednesday · Today
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Plus className="size-3 text-muted-foreground" />
                      <span>New Entry</span>
                    </div>
                  </div>

                  {/* Task / Event cards */}
                  <div className="space-y-2">
                    {tasks.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          item.type === "task" && toggleTask(item.id)
                        }
                        className={cn(
                          "group relative flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors select-none hover:bg-surface",
                          item.done && "opacity-60"
                        )}
                      >
                        {/* Checkbox or Event */}
                        {item.type === "task" ? (
                          <button
                            type="button"
                            aria-label="Toggle task"
                            className={cn(
                              "mt-0.5 flex size-4.5 flex-none items-center justify-center rounded-md border text-xs transition-colors",
                              item.done
                                ? "border-mineral-emerald bg-mineral-emerald-tint text-mineral-emerald font-semibold"
                                : "border-border bg-surface-inset text-transparent hover:border-mineral-emerald/60"
                            )}
                          >
                            <Check className="size-3" />
                          </button>
                        ) : (
                          <div className="mt-0.5 flex size-4.5 flex-none items-center justify-center rounded-full bg-surface-inset text-muted-foreground">
                            <Clock className="size-3 text-muted-foreground" />
                          </div>
                        )}

                        {/* Title and Meta */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className={cn(
                                "text-[13px] font-medium leading-snug",
                                item.done
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              )}
                            >
                              {item.title}
                            </p>
                            <span
                              className={cn(
                                "rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-muted-foreground"
                              )}
                            >
                              {item.type}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground tabular-nums">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="size-3 text-muted-foreground/70" />
                              {item.time}
                            </span>
                            {item.loc && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <MapPin className="size-3 text-muted-foreground/70" />
                                {item.loc}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <img
              src="/icon-192.png"
              alt="DayStitch"
              className="size-5 rounded"
            />
            <span>DayStitch</span>
          </div>
          <div>&copy; {new Date().getFullYear()} DayStitch</div>
        </div>
      </footer>
    </div>
  )
}
