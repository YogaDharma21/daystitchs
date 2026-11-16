import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useClerk } from "@clerk/expo";

export default function SSOCallbackScreen() {
  const params = useLocalSearchParams<{
    created_session_id?: string;
    createdSessionId?: string;
  }>();
  const { setActive } = useClerk();
  const sessionId = params.created_session_id || params.createdSessionId;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      if (sessionId && setActive) {
        try {
          await setActive({ session: sessionId });
        } catch {
          // ponytail: session may already be activated by startSSOFlow; ignore error and proceed.
        }
      }
      if (mounted) {
        setReady(true);
      }
    }

    void handleCallback();

    return () => {
      mounted = false;
    };
  }, [sessionId, setActive]);

  if (!ready) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#08090b]"
        testID="sso-callback-loading"
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return <Redirect href="/" />;
}
