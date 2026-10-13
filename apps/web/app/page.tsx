import DaystitchShell from "@/components/daystitch-shell"
import MissingKeysShell from "@/components/missing-keys-shell"

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function Page() {
  if (!hasClerkKey) {
    return <MissingKeysShell />
  }

  return <DaystitchShell />
}
