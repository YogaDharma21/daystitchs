import React from "react";
import { View, Text, Pressable } from "react-native";
import { fmtTime, type DayEntry } from "../../lib/daystitch";

interface TaskCardProps {
  entry: DayEntry;
  onToggle?: () => void;
  onPress?: () => void;
}

export function TaskCard({ entry, onToggle, onPress }: TaskCardProps) {
  const isDone = Boolean(entry.done);
  const timeText = entry.time ? fmtTime(entry.time) : "";

  return (
    <Pressable
      testID={`task-card-${entry._id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${entry.title}`}
      className="flex-row items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 mb-2.5 active:bg-neutral-800/80"
    >
      <Pressable
        testID="task-checkbox"
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={`Mark ${entry.title} as ${isDone ? "incomplete" : "complete"}`}
        className={`mt-0.5 h-5 w-5 rounded-md border items-center justify-center ${
          isDone
            ? "border-emerald-500 bg-emerald-500"
            : "border-neutral-600 bg-neutral-950"
        }`}
      >
        {isDone ? (
          <Text className="text-xs font-bold text-black">✓</Text>
        ) : null}
      </Pressable>

      <View className="flex-1">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text
            testID="task-title"
            className={`text-base font-semibold ${
              isDone ? "line-through text-neutral-500" : "text-white"
            }`}
          >
            {entry.title}
          </Text>
          {timeText ? (
            <Text
              testID="task-time"
              className="text-xs font-medium text-neutral-400"
            >
              {timeText}
            </Text>
          ) : null}
        </View>

        {entry.detail ? (
          <Text
            testID="task-detail"
            className={`mt-1 text-xs leading-relaxed ${
              isDone ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            {entry.detail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
