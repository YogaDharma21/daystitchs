import React from "react";
import { View, Text } from "react-native";
import { weekLabel } from "../../lib/daystitch";

interface WeekHeaderProps {
  sun: Date;
  count?: number;
}

export function WeekHeader({ sun, count }: WeekHeaderProps) {
  const label = weekLabel(sun);

  return (
    <View
      testID="week-header"
      className="flex-row items-center justify-between px-6 py-2.5 bg-neutral-950/80 border-b border-neutral-800/60"
    >
      <Text
        testID="week-label"
        className="text-xs font-bold tracking-wider uppercase text-neutral-400"
      >
        {label}
      </Text>
      {typeof count === "number" && count > 0 ? (
        <View className="rounded-full bg-neutral-900 px-2 py-0.5 border border-neutral-800">
          <Text className="text-[11px] font-medium text-neutral-400">
            {count} {count === 1 ? "entry" : "entries"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
