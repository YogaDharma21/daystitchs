"use client"

import * as React from "react"
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Info,
  Layers,
  MapPin,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "cn"

interface LandingPageProps {
  signInTrigger?: React.ReactNode
  heroSignInTrigger?: React.ReactNode
  isConfigMissing?: boolean
}

export function DayStitchBrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/90 to-primary text-primary-foreground shadow-md shadow-primary/20",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        {/* Continuous stitch curve with node points */}
        <path d="M4 19L9 14M15 8L20 3" />
        <path d="M8 20l8-8" strokeDasharray="2 3" />
        <circle cx="9" cy="14" r="2" fill="currentColor" />
        <circle cx="15" cy="8" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}

export default function LandingPage({
  signInTrigger,
  heroSignInTrigger,
  isConfigMissing = false,
}: LandingPageProps) {
  const [showConfigModal, setShowConfigModal] = React.useState(false)

  // Interactive mockup tasks state so the user can interactively toggle them on the landing page!
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
        <div className="absolute -top-40 left-1/2 size-[650px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute top-[40%] -right-40 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -left-40 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
        {/* Subtle grid pattern */}
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
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <DayStitchBrandMark />
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">
                DayStitch
              </span>
              <span className="rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Timeline
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a
              href="#preview"
              className="transition-colors hover:text-foreground"
            >
              Preview
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#difference"
              className="transition-colors hover:text-foreground"
            >
              Why DayStitch
            </a>
          </nav>

          <div className="flex items-center gap-3">{headerAction}</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Top pill badge */}
          <div className="mb-6 inline-flex animate-in items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm duration-700 fade-in slide-in-from-bottom-2">
            <Sparkles className="size-3.5 text-primary" />
            <span>The Continuous Daily Agenda</span>
          </div>

          {/* Hero title */}
          <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Stitch your days together,{" "}
            <span className="mt-1 block bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent sm:mt-2">
              without the clutter.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Calendars isolate your schedule into fragmented boxes. Todo lists
            lose time context. DayStitch weaves your tasks, events, and focus
            into one continuous, beautiful stream.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row">
            {heroAction}
            <a
              href="#preview"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border/80 bg-secondary/40 px-6 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-secondary"
            >
              See Interactive Preview
            </a>
          </div>

          {/* Vibe highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground/80 sm:gap-10">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <span>Zero-friction logging</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <span>One unified timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              <span>Instant month & date jump</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mockup / Timeline Preview Section */}
      <section id="preview" className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col justify-between gap-3 text-left sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                Live Interface Preview
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                The flow of time, uninterrupted
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: Click any task below to toggle completion
            </p>
          </div>

          {/* App Window Frame Mockup */}
          <div className="relative rounded-2xl border border-border/80 bg-card/60 p-1 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
            {/* Window bar */}
            <div className="flex items-center justify-between rounded-t-xl border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500/80" />
                <span className="size-3 rounded-full bg-yellow-500/80" />
                <span className="size-3 rounded-full bg-green-500/80" />
                <span className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline">
                  daystitch.app
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-border/60 bg-secondary/80 px-2.5 py-1 text-xs font-semibold">
                  Today · Oct 22
                </span>
                <span className="flex size-7 items-center justify-center rounded-full border border-primary/40 bg-primary/20 text-xs font-semibold text-primary">
                  YD
                </span>
              </div>
            </div>

            {/* Inner Timeline Simulator */}
            <div className="space-y-6 p-4 sm:p-8">
              {/* Month Banner */}
              <div className="border-b border-border/40 pb-4">
                <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  2026 · 4 entries
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-extrabold tracking-tight">
                    October
                  </h3>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Jump to Month</span>
                  </div>
                </div>
              </div>

              {/* Day Row with Continuous Stitch Line */}
              <div className="relative grid grid-cols-[48px_1fr] gap-4">
                {/* Continuous vertical stitch line */}
                <div
                  aria-hidden="true"
                  className="absolute top-4 bottom-0 left-[23px] w-[2px] bg-gradient-to-b from-primary via-border to-border/20"
                />

                {/* Day Marker */}
                <div className="relative flex flex-col items-center">
                  <div className="z-10 flex size-9 flex-col items-center justify-center rounded-xl border border-primary/50 bg-background text-xs font-semibold text-primary shadow-sm">
                    <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
                      Wed
                    </span>
                    <span className="text-sm leading-none font-bold">22</span>
                  </div>
                  <div className="mt-2 size-2 rounded-full bg-primary" />
                </div>

                {/* Day Entries List */}
                <div className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Wednesday · Today
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Plus className="size-3 text-primary" />
                      <span>New Entry</span>
                    </div>
                  </div>

                  {/* Task / Event cards */}
                  <div className="space-y-2.5">
                    {tasks.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          item.type === "task" && toggleTask(item.id)
                        }
                        className={cn(
                          "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all select-none sm:p-3.5",
                          item.type === "event"
                            ? "border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08]"
                            : item.done
                              ? "border-border/30 bg-secondary/30 opacity-60"
                              : "border-border/60 bg-secondary/60 hover:border-border hover:bg-secondary"
                        )}
                      >
                        {/* Checkbox or Event Icon */}
                        {item.type === "task" ? (
                          <button
                            type="button"
                            aria-label="Toggle task"
                            className={cn(
                              "mt-0.5 flex size-5 flex-none items-center justify-center rounded-full border text-xs transition-all",
                              item.done
                                ? "border-transparent bg-primary text-primary-foreground"
                                : "border-border text-transparent hover:border-primary/60"
                            )}
                          >
                            <Check className="size-3" />
                          </button>
                        ) : (
                          <div className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Clock className="size-3" />
                          </div>
                        )}

                        {/* Title and Meta */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm leading-snug font-medium",
                                item.done &&
                                  "text-muted-foreground line-through"
                              )}
                            >
                              {item.title}
                            </p>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                                item.type === "event"
                                  ? "border border-primary/20 bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {item.type}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

      {/* Core Features Grid */}
      <section
        id="features"
        className="border-t border-border/40 bg-muted/20 px-6 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
              Thoughtful Design
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything in harmony. Nothing in your way.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Built from first principles for people who want to plan and
              reflect on their days without cognitive fatigue.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-5" />
              </div>
              <h3 className="text-lg font-bold">Continuous Stream</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Scroll naturally through past, present, and future days. No
                clicking next-week arrows, no broken mental models.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="text-lg font-bold">Unified Agenda</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Checkboxes for your tasks, scheduled times for your meetings,
                and notes for your thoughts—all woven into the same line.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Compass className="size-5" />
              </div>
              <h3 className="text-lg font-bold">Instant Navigation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Jump across months and years in a single click with the
                interactive month grid, then snap back to Today in an instant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference Section */}
      <section id="difference" className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-8 shadow-xl backdrop-blur-sm sm:p-12">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                A Clearer Perspective
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Traditional Tools vs. DayStitch
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* The Old Way */}
              <div className="space-y-4 rounded-2xl border border-border/40 bg-secondary/30 p-6">
                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  The Fragmented Way
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-destructive">&times;</span>
                    <span>
                      Separate calendar app and separate todo list app
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-destructive">&times;</span>
                    <span>Switching between day, week, and month screens</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-destructive">&times;</span>
                    <span>
                      Rigid 15-minute grid blocks that create visual stress
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-destructive">&times;</span>
                    <span>Complex forms to add a simple 10-minute task</span>
                  </li>
                </ul>
              </div>

              {/* The DayStitch Way */}
              <div className="space-y-4 rounded-2xl border border-primary/40 bg-primary/[0.06] p-6">
                <div className="text-xs font-bold tracking-wider text-primary uppercase">
                  The DayStitch Way
                </div>
                <ul className="space-y-3 text-sm text-foreground">
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 flex-none text-primary" />
                    <span>One unified stream for all tasks and events</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 flex-none text-primary" />
                    <span>Fluid continuous scroll across your days</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 flex-none text-primary" />
                    <span>
                      Clean aesthetic designed for calm and deep focus
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 flex-none text-primary" />
                    <span>
                      Lightning fast capture with optional time & notes
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-t border-border/40 px-6 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-2xl space-y-6">
          <DayStitchBrandMark className="mx-auto size-12" />
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to stitch your days together?
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Experience the calm of a continuous daily timeline. Sign in to start
            organizing your schedule today.
          </p>
          <div className="flex justify-center pt-2">{heroAction}</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">DayStitch</span>
            <span>&middot; Continuous Daily Agenda</span>
          </div>
          <div>Built with craft for daily clarity.</div>
        </div>
      </footer>
    </div>
  )
}
