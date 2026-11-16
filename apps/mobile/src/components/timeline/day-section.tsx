import React from "react";
import { View, Text, Pressable, type LayoutChangeEvent } from "react-native";
import { isoDay, sortEntries, type DayEntry } from "../../lib/daystitch";
import { EventCard } from "./event-card";
import { TaskCard } from "./task-card";

interface DaySectionProps {
  day: Date;
  todayKey: string;
  entries: DayEntry[];
  onToggleDone?: (id: string) => void;
  onOpenEntry?: (entry: DayEntry) => void;
  onAddEntry?: (date: string) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function DaySection({
  day,
  todayKey,
  entries,
  onToggleDone,
  onOpenEntry,
  onAddEntry,
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
      className="px-4 pt-4 pb-2 border-b border-border-subtle"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {weekday}
          </Text>
          <Text className="text-base font-semibold text-foreground">
            {dayOfMonth}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {isToday ? (
            <View
              testID="today-indicator"
              className="rounded-full bg-foreground px-2.5 py-0.5"
            >
              <Text className="text-xs font-semibold text-background">Today</Text>
            </View>
          ) : null}
          <Pressable
            testID="add-entry-button"
            onPress={() => onAddEntry?.(key)}
            accessibilityRole="button"
            accessibilityLabel={`Add entry for ${weekday} ${dayOfMonth}`}
            className="h-6 w-6 items-center justify-center rounded-full border border-border bg-surface active:bg-surface-inset"
          >
            <Text className="text-xs font-medium text-muted-foreground">+</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-col">
        {sorted.length === 0 ? (
          <Text className="py-2 text-xs text-subtle-foreground">
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
