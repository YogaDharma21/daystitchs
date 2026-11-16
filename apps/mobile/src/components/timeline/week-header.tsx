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
      className="flex-row items-center justify-between px-6 py-2.5 bg-background border-b border-border-subtle"
    >
      <Text
        testID="week-label"
        className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground"
      >
        {label}
      </Text>
      {typeof count === "number" && count > 0 ? (
        <View className="rounded-full bg-surface px-2 py-0.5 border border-border">
          <Text className="text-[11px] font-medium text-muted-foreground">
            {count} {count === 1 ? "entry" : "entries"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
