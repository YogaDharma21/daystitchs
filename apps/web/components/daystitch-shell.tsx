"use client"

import { useSyncExternalStore } from "react"
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
            className="group flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 active:scale-95"
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
            className="group flex h-12 items-center gap-2.5 rounded-full px-8 text-base font-semibold transition-all duration-300 active:scale-95"
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

function checkHasSession(): boolean {
  if (typeof document === "undefined") {
    return false
  }
  const cookies = document.cookie
  if (!cookies) {
    return false
  }
  const uatMatch = cookies.match(/(?:^|;\s*)__client_uat\s*=\s*([^;]+)/)
  if (uatMatch) {
    const val = uatMatch[1]
    if (val === "0" || val === "") {
      return false
    }
    return true
  }
  return /(?:^|;\s*)__session\s*=/.test(cookies)
}

const emptySubscribe = () => () => {}

function useHasSessionCookie() {
  return useSyncExternalStore(emptySubscribe, checkHasSession, () => false)
}

// Clerk Core 3 removed the <SignedIn>/<SignedOut>/<ClerkLoaded>/<ClerkLoading>
// control components, so the shell branches on useAuth directly.
export default function DaystitchShell() {
  const { isLoaded, isSignedIn } = useAuth()
  const hasSession = useHasSessionCookie()

  if (!isLoaded) {
    // If the user has not logged in (no session cookie), do not show the main
    // page skeleton; show the landing page directly.
    if (!hasSession) {
      return <SignedOutGate />
    }
    return <ShellLoading />
  }

  if (!isSignedIn) {
    return <SignedOutGate />
  }

  return <AppShell />
}
