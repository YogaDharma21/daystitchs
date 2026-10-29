"use client"

import * as React from "react"
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Info,
  Plus,
  Search,
  User,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

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
      className="group flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 active:scale-95"
    >
      <span>Sign in</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Button>
  )

  const defaultHeroSignInButton = (
    <Button
      size="lg"
      onClick={handleFallbackClick}
      className="group flex h-12 items-center gap-2.5 rounded-full px-8 text-base font-semibold transition-all duration-300 active:scale-95"
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
        <div className="absolute -top-40 left-1/2 size-[650px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute top-[40%] -right-40 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -left-40 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />
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
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="DayStitch"
              className="size-8 rounded-lg shadow-sm"
            />
            <span className="text-lg font-bold tracking-tight">DayStitch</span>
          </div>

          <div className="flex items-center gap-3">{headerAction}</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-14 sm:pt-28 sm:pb-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Hero title */}
          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Stitch your days together,{" "}
            <span className="mt-1 block bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent sm:mt-2">
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
          <div className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_28px_56px_-40px_rgba(0,0,0,0.9)]">
            {/* Timeline Sticky Header */}
            <div className="flex items-center justify-between border-b border-border bg-background/95 px-6 py-3">
              <div className="flex items-center gap-1.5 text-base font-semibold tracking-tight sm:text-lg">
                <span>October 2026</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Search className="size-4" />
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <CalendarDays className="size-4" />
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <User className="size-4" />
                </div>
              </div>
            </div>

            {/* Inner Timeline Content */}
            <div>
              {/* Month Banner */}
              <div
                className="relative flex min-h-[150px] flex-col justify-center overflow-hidden px-6 pt-12 pb-11 sm:px-[58px]"
                style={{
                  background:
                    "radial-gradient(105% 140% at 88% 0%, color-mix(in oklch, var(--primary) 9%, transparent), transparent 58%), linear-gradient(180deg, color-mix(in oklch, var(--secondary) 28%, var(--background)), color-mix(in oklch, var(--secondary) 52%, var(--background)))",
                  color: "var(--secondary-foreground)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[128px] leading-none font-extrabold tabular-nums select-none"
                  style={{
                    color:
                      "color-mix(in oklch, var(--foreground) 8%, transparent)",
                  }}
                >
                  10
                </span>
                <p className="relative m-0 mb-1.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  2026 · 4 entries
                </p>
                <h2 className="relative m-0 text-[34px] font-extrabold tracking-[-0.03em]">
                  October
                </h2>
              </div>

              {/* Week Row */}
              <div className="flex w-full items-center gap-3 px-6 pt-8 pb-1 text-left text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                <span className="flex-none">Oct 18 – 24</span>
                <span className="flex-none rounded-full border border-border bg-secondary px-2.5 py-0.5 tracking-normal normal-case text-foreground">
                  4 entries
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <ChevronDown className="size-3.5 flex-none text-muted-foreground" />
              </div>

              {/* Day Section */}
              <div className="relative grid grid-cols-[44px_1fr] gap-2 px-6 pt-5 pb-8">
                {/* Connector line down the day column */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 bottom-0 left-[45px] w-px bg-foreground/14"
                />

                {/* Day Marker */}
                <div className="relative z-[1] flex flex-col items-center gap-0.5 pt-0.5">
                  <span className="bg-card text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    Wed
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full text-lg font-bold tabular-nums bg-primary text-primary-foreground">
                    22
                  </span>
                  <div className="mt-2 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Plus className="size-3" />
                  </div>
                </div>

                {/* Day Entries List */}
                <div className="min-w-0 space-y-2.5">
                  {tasks.map((item) =>
                    item.type === "event" ? (
                      <div
                        key={item.id}
                        className="cursor-pointer rounded-xl bg-secondary/50 px-3.5 py-3 transition-colors hover:bg-secondary/70"
                      >
                        <div className="text-sm font-semibold">
                          {item.title}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {item.time} · {item.loc}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={item.id}
                        onClick={() => toggleTask(item.id)}
                        className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-secondary/50 px-3.5 py-3 transition-colors hover:bg-secondary/70"
                      >
                        <button
                          type="button"
                          aria-label={`Toggle ${item.title}`}
                          className={cn(
                            "mt-0.5 flex size-5 flex-none items-center justify-center rounded-full border text-xs transition-all",
                            item.done
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border text-transparent hover:border-primary/60"
                          )}
                        >
                          {item.done ? "✓" : ""}
                        </button>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "text-sm font-semibold",
                              item.done && "line-through opacity-60"
                            )}
                          >
                            {item.title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {item.time} · {item.loc}
                          </div>
                        </div>
                      </div>
                    )
                  )}
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
