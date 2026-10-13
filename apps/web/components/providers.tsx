"use client"

import * as React from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = React.useMemo(() => {
    if (!convexUrl) {
      return null
    }
    return new ConvexReactClient(convexUrl)
  }, [])

  if (!client) {
    return <>{children}</>
  }

  if (!clerkPublishableKey) {
    return <ConvexProvider client={client}>{children}</ConvexProvider>
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}

export { ConvexClientProvider }
