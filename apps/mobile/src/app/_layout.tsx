import "../../global.css";
import React, { useMemo } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Slot } from "expo-router";
import { tokenCache } from "../utils/cache";
import { AuthGate } from "../components/auth-gate";

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_placeholder";
const convexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

export default function RootLayout() {
  const convex = useMemo(
    () =>
      new ConvexReactClient(convexUrl, {
        unsavedChangesWarning: false,
      }),
    []
  );

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <AuthGate>
            <Slot />
          </AuthGate>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
