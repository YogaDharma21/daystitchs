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
      className="rounded-xl border border-border bg-card p-3.5 mb-2.5 active:bg-surface"
    >
      <View className="flex-row items-baseline justify-between gap-2">
        <Text
          testID="event-title"
          className="text-[13px] font-medium leading-snug text-foreground flex-1"
        >
          {entry.title}
        </Text>
        {timeRange ? (
          <Text
            testID="event-time"
            className="text-[11px] font-medium text-muted-foreground"
          >
            {timeRange}
          </Text>
        ) : null}
      </View>

      {entry.loc ? (
        <Text
          testID="event-location"
          className="mt-1 text-[11px] text-muted-foreground font-normal"
        >
          📍 {entry.loc}
        </Text>
      ) : null}

      {entry.detail ? (
        <Text
          testID="event-detail"
          className="mt-1 text-xs text-muted-foreground leading-relaxed"
        >
          {entry.detail}
        </Text>
      ) : null}
    </Pressable>
  );
}
