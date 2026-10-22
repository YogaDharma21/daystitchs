"use client"

import { useAuth } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import DaystitchTimeline, { TimelineLoading } from "@/components/timeline"
import LandingPage from "@/components/landing-page"

function SkeletonShape({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`animate-pulse bg-muted motion-reduce:animate-none ${className}`}
    />
  )
}

function ShellLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto flex min-h-svh w-full max-w-[1000px] flex-col"
    >
      <p className="sr-only">Loading DayStitch…</p>
      {/* Same sticky header row as the timeline, so nothing moves when the
          real header takes over. Right-hand circles get gray stand-ins:
          Search, Today, and Clerk's UserButton. */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <SkeletonShape className="h-7 w-36 rounded-md" />
        <div className="flex items-center gap-2">
          <SkeletonShape className="size-8 rounded-full" />
          <SkeletonShape className="size-8 rounded-full" />
          <SkeletonShape className="size-8 rounded-full" />
        </div>
      </div>
      <TimelineLoading />
    </div>
  )
}

function SignedOutGate() {
  return (
    <LandingPage
      signInTrigger={
        <SignInButton mode="modal">
          <Button
            size="lg"
            className="group flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium shadow-md shadow-primary/20 transition-all hover:shadow-primary/30"
          >
            <span>Sign in</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </SignInButton>
      }
      heroSignInTrigger={
        <SignInButton mode="modal">
          <Button
            size="lg"
            className="group flex h-12 items-center gap-2.5 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/35 active:scale-[0.98]"
          >
            <span>Start Stitching Your Days</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </SignInButton>
      }
    />
  )
}

function AppShell() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1000px] flex-col">
      <main className="flex flex-1 flex-col">
        {/* The account menu rides in the timeline's sticky header, next to
            Today, so it stays reachable at any scroll position. */}
        <DaystitchTimeline accountSlot={<UserButton />} />
      </main>
    </div>
  )
}

// Clerk Core 3 removed the <SignedIn>/<SignedOut>/<ClerkLoaded>/<ClerkLoading>
// control components, so the shell branches on useAuth directly. Same three
// states: loading skeleton, sign-in-only gate, signed-in app.
export default function DaystitchShell() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) {
    return <ShellLoading />
  }
  if (!isSignedIn) {
    return <SignedOutGate />
  }
  return <AppShell />
}
