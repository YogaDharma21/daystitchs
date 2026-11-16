import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useConvexAuth } from "convex/react";
import { useUser, useClerk, useSSO } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

interface AuthGateProps {
  children?: React.ReactNode;
  onSignIn?: () => void;
}

export function AuthGate({ children, onSignIn }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { startSSOFlow } = useSSO();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (onSignIn) {
      onSignIn();
      return;
    }
    // ponytail: direct google oauth via Clerk SSO; upgrade to multi-provider sheet if requested.
    try {
      setIsSubmitting(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch {
      // User dismissed or network failed; state remains clean without alert popups.
    } finally {
      setIsSubmitting(false);
    }
  }, [onSignIn, startSSOFlow]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <ActivityIndicator size="large" color="#f4f4f2" />
        <Text className="mt-4 text-sm text-muted-foreground">Loading DayStitch...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6" testID="sign-in-view">
        <View className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 items-center shadow-2xl">
          <Text className="text-2xl font-bold text-foreground tracking-tight">DayStitch</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Sign In to DayStitch
          </Text>
          <Pressable
            testID="sign-in-button"
            onPress={handleSignIn}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-foreground py-3.5 items-center active:opacity-90 disabled:opacity-50 shadow-xs"
            accessibilityRole="button"
            accessibilityLabel="Sign In with Google"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#08090b" />
            ) : (
              <Text className="font-semibold text-background">Sign In with Google</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  const userIdentifier =
    user?.primaryEmailAddress?.emailAddress ??
    user?.fullName ??
    user?.username ??
    "User";

  return (
    <View className="flex-1 bg-background" testID="authenticated-shell">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3 bg-card">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-muted-foreground">DayStitch</Text>
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            Signed in as {userIdentifier}
          </Text>
        </View>
        <Pressable
          testID="sign-out-button"
          onPress={() => signOut()}
          className="rounded-full border border-border bg-surface px-3 py-1.5 active:bg-surface-inset"
          accessibilityRole="button"
          accessibilityLabel="Sign Out"
        >
          <Text className="text-xs font-semibold text-foreground">Sign Out</Text>
        </Pressable>
      </View>
      <View className="flex-1">
        {children}
      </View>
    </View>
  );
}
