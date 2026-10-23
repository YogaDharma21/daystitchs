import React from "react";
import { View, Text } from "react-native";
import { titleForYm } from "../../lib/daystitch";

interface MonthBannerProps {
  year: number;
  month: number;
  count: number;
}

export function MonthBanner({ year, month, count }: MonthBannerProps) {
  const ym = `${year}-${month}`;
  const title = titleForYm(ym);
  const countLabel = `${count} ${count === 1 ? "entry" : "entries"}`;

  return (
    <View
      testID="month-banner"
      className="bg-neutral-900 border-b border-neutral-800 px-6 py-6 flex-row items-center justify-between"
    >
      <View>
        <Text
          testID="month-title"
          className="text-2xl font-extrabold text-white tracking-tight"
        >
          {title}
        </Text>
        <Text className="text-xs text-neutral-400 mt-0.5">
          {year}
        </Text>
      </View>
      <View
        testID="month-count"
        className="rounded-full bg-neutral-800 px-3 py-1 border border-neutral-700"
      >
        <Text className="text-xs font-semibold text-neutral-300">
          {countLabel}
        </Text>
      </View>
    </View>
  );
}
