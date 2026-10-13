import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConvexClientProvider } from "@/components/providers"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "DayStitch",
  description: "Stitch your days together.",
}

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = (
    <ThemeProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ThemeProvider>
  )

  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
      style={{ colorScheme: "dark" }}
    >
      <body
        className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
      >
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  )
}
