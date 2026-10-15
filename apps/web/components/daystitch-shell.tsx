"use client"

import { useAuth } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import DaystitchTimeline, { TimelineLoading } from "@/components/timeline"

function SkeletonShape({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-muted animate-pulse motion-reduce:animate-none ${className}`}
    />
  )
}

function ShellLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto flex min-h-svh w-full max-w-2xl flex-col"
    >
      <p className="sr-only">Loading DayStitch…</p>
      {/* Same two header rows as AppShell and the timeline, so nothing moves
          when the real header takes over. */}
      <header className="flex items-center justify-end border-b px-6 py-4">
        {/* Clerk's UserButton renders nothing until Clerk is ready, so leave
            the spot blank and keep the row height. The real circle appears
            the moment Clerk resolves. */}
        <span aria-hidden="true" className="size-8" />
      </header>
      <div className="flex items-center justify-between border-b px-6 py-3">
        <SkeletonShape className="h-7 w-36 rounded-md" />
        <SkeletonShape className="size-8 rounded-full" />
      </div>
      <TimelineLoading />
    </div>
  )
}

function SignedOutGate() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-medium">DayStitch</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to stitch your days together.
        </p>
        <SignInButton mode="modal">
          <Button size="lg">Sign in</Button>
        </SignInButton>
      </div>
    </div>
  )
}

function AppShell() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col">
      <header className="flex items-center justify-end border-b px-6 py-4">
        <UserButton />
      </header>
      <main className="flex flex-1 flex-col">
        <DaystitchTimeline />
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
