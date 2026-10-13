"use client"

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"

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
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className="text-base font-medium">No entries yet</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Your timeline is empty. New entries will appear here once you add
          them.
        </p>
      </main>
    </div>
  )
}

export default function DaystitchShell() {
  return (
    <>
      <ClerkLoading>
        <ShellLoading />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignedOutGate />
        </SignedOut>
        <SignedIn>
          <AppShell />
        </SignedIn>
      </ClerkLoaded>
    </>
  )
}
