"use client"

import { useAuth } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import DaystitchTimeline from "@/components/timeline"

function ShellLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading DayStitch"
      className="flex min-h-svh items-center justify-center p-6"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
        <p className="text-muted-foreground text-sm">Loading DayStitch…</p>
      </div>
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
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-medium">DayStitch</h1>
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
