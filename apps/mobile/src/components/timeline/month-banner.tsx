import React from "react";
import { View, Text } from "react-native";

interface MonthBannerProps {
  year: number;
  month: number;
  count: number;
}

export function MonthBanner({ year, month, count }: MonthBannerProps) {
  const title = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const countLabel = `${count} ${count === 1 ? "entry" : "entries"}`;

  return (
    <View
      testID="month-banner"
      className="bg-card border-b border-border px-6 py-6 flex-row items-center justify-between"
    >
      <View>
        <Text
          testID="month-title"
          className="text-2xl font-bold text-foreground tracking-tight"
        >
          {title}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {year}
        </Text>
      </View>
      <View
        testID="month-count"
        className="rounded-full bg-surface px-2.5 py-0.5 border border-border"
      >
        <Text className="text-xs font-medium text-muted-foreground">
          {countLabel}
        </Text>
      </View>
    </View>
  );
}
