import React from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useConvexAuth } from "convex/react";
import { useUser, useClerk, useSignIn } from "@clerk/expo";

interface AuthGateProps {
  children?: React.ReactNode;
  onSignIn?: () => void;
}

export function AuthGate({ children, onSignIn }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const signInResult = useSignIn() as unknown as { isLoaded?: boolean; signIn?: { create: (opts: unknown) => Promise<unknown> } };
  const { signIn, isLoaded } = signInResult;

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
      return;
    }
    // ponytail: basic Clerk sign-in trigger; upgrade to full OAuth sheet in Phase 2.
    if (isLoaded && signIn) {
      void signIn.create({ identifier: "" }).catch(() => {});
      return;
    }
    Alert.alert("Sign In", "Sign in with Clerk");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-6">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-sm text-neutral-400">Loading DayStitch...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-6" testID="sign-in-view">
        <View className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 items-center shadow-lg">
          <Text className="text-2xl font-bold text-white tracking-tight">DayStitch</Text>
          <Text className="mt-2 text-center text-sm text-neutral-400">
            Sign In to DayStitch
          </Text>
          <Pressable
            testID="sign-in-button"
            onPress={handleSignIn}
            className="mt-6 w-full rounded-xl bg-white py-3.5 items-center active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel="Sign In"
          >
            <Text className="font-semibold text-black">Sign In</Text>
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
    <View className="flex-1 bg-black" testID="authenticated-shell">
      <View className="flex-row items-center justify-between border-b border-neutral-800 px-4 py-3 bg-neutral-950">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-neutral-500">DayStitch</Text>
          <Text className="text-sm font-medium text-neutral-200" numberOfLines={1}>
            Signed in as {userIdentifier}
          </Text>
        </View>
        <Pressable
          testID="sign-out-button"
          onPress={() => signOut()}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 active:bg-neutral-800"
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
