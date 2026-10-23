import React from "react";
import { View, Text, Pressable } from "react-native";
import { fmtRange, type DayEntry } from "../../lib/daystitch";

interface EventCardProps {
  entry: DayEntry;
  onPress?: () => void;
}

export function EventCard({ entry, onPress }: EventCardProps) {
  const timeRange = fmtRange(entry);

  return (
    <Pressable
      testID={`event-card-${entry._id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${entry.title}`}
      className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3.5 mb-2.5 active:bg-neutral-800/80"
    >
      <View className="flex-row items-baseline justify-between gap-2">
        <Text
          testID="event-title"
          className="text-base font-semibold text-white flex-1"
        >
          {entry.title}
        </Text>
        {timeRange ? (
          <Text
            testID="event-time"
            className="text-xs font-medium text-neutral-300"
          >
            {timeRange}
          </Text>
        ) : null}
      </View>

      {entry.loc ? (
        <Text
          testID="event-location"
          className="mt-1 text-xs text-neutral-400 font-medium"
        >
          📍 {entry.loc}
        </Text>
      ) : null}

      {entry.detail ? (
        <Text
          testID="event-detail"
          className="mt-1 text-xs text-neutral-400 leading-relaxed"
        >
          {entry.detail}
        </Text>
      ) : null}
    </Pressable>
  );
}
