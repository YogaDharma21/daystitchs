import React from "react";
import { View, Text, type LayoutChangeEvent } from "react-native";
import { isoDay, sortEntries, type DayEntry } from "../../lib/daystitch";
import { EventCard } from "./event-card";
import { TaskCard } from "./task-card";

interface DaySectionProps {
  day: Date;
  todayKey: string;
  entries: DayEntry[];
  onToggleDone?: (id: string) => void;
  onOpenEntry?: (entry: DayEntry) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function DaySection({
  day,
  todayKey,
  entries,
  onToggleDone,
  onOpenEntry,
  onLayout,
}: DaySectionProps) {
  const key = isoDay(day);
  const isToday = key === todayKey;
  const weekday = day.toLocaleDateString("en-US", { weekday: "short" });
  const dayOfMonth = day.getDate();
  const sorted = sortEntries(entries);

  return (
    <View
      testID={`day-section-${key}`}
      onLayout={onLayout}
      className="px-4 pt-4 pb-2 border-b border-neutral-900"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {weekday}
          </Text>
          <Text className="text-lg font-bold text-white">
            {dayOfMonth}
          </Text>
        </View>

        {isToday ? (
          <View
            testID="today-indicator"
            className="rounded-full bg-blue-600 px-2.5 py-0.5"
          >
            <Text className="text-xs font-bold text-white">Today</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-col">
        {sorted.length === 0 ? (
          <Text className="py-2 text-xs italic text-neutral-600">
            No entries
          </Text>
        ) : (
          sorted.map((entry) =>
            entry.type === "event" ? (
              <EventCard
                key={entry._id}
                entry={entry}
                onPress={() => onOpenEntry?.(entry)}
              />
            ) : (
              <TaskCard
                key={entry._id}
                entry={entry}
                onToggle={() => onToggleDone?.(entry._id)}
                onPress={() => onOpenEntry?.(entry)}
              />
            )
          )
        )}
      </View>
    </View>
  );
}
