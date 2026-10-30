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
      <View className="flex-1 items-center justify-center bg-[#08090b] p-6">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-sm text-neutral-400">Loading DayStitch...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#08090b] p-6" testID="sign-in-view">
        <View className="w-full max-w-sm rounded-2xl border border-white/[0.07] bg-[#121316] p-8 items-center shadow-lg">
          <Text className="text-2xl font-bold text-white tracking-tight">DayStitch</Text>
          <Text className="mt-2 text-center text-sm text-neutral-400">
            Sign In to DayStitch
          </Text>
          <Pressable
            testID="sign-in-button"
            onPress={handleSignIn}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-white py-3.5 items-center active:opacity-90 disabled:opacity-50"
            accessibilityRole="button"
            accessibilityLabel="Sign In with Google"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text className="font-semibold text-black">Sign In with Google</Text>
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
    <View className="flex-1 bg-[#08090b]" testID="authenticated-shell">
      <View className="flex-row items-center justify-between border-b border-white/[0.07] px-4 py-3 bg-[#121316]">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-neutral-500">DayStitch</Text>
          <Text className="text-sm font-medium text-neutral-200" numberOfLines={1}>
            Signed in as {userIdentifier}
          </Text>
        </View>
        <Pressable
          testID="sign-out-button"
          onPress={() => signOut()}
          className="rounded-lg border border-white/[0.07] bg-neutral-900 px-3 py-1.5 active:bg-neutral-800"
          accessibilityRole="button"
          accessibilityLabel="Sign Out"
        >
          <Text className="text-xs font-semibold text-neutral-300">Sign Out</Text>
        </Pressable>
      </View>
      <View className="flex-1">
        {children}
      </View>
    </View>
  );
}
