import { Button } from "@workspace/ui/components/button"

export default function MissingKeysShell() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-medium">DayStitch</h1>
        <p className="text-muted-foreground text-sm">
          Auth and data providers are not configured. Add
          <code className="bg-muted rounded px-1 font-mono text-xs">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          and{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            NEXT_PUBLIC_CONVEX_URL
          </code>{" "}
          to boot the full app shell.
        </p>
        <Button size="lg" disabled>
          Sign in
        </Button>
      </div>
    </div>
  )
}
