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
      className={`flex-row items-start gap-3 rounded-xl border border-border bg-card p-3.5 mb-2.5 active:bg-surface ${
        isDone ? "opacity-60" : ""
      }`}
    >
      <Pressable
        testID="task-checkbox"
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={`Mark ${entry.title} as ${isDone ? "incomplete" : "complete"}`}
        className={`mt-0.5 h-4.5 w-4.5 rounded-md border items-center justify-center ${
          isDone
            ? "border-mineral-emerald bg-mineral-emerald-tint"
            : "border-border bg-surface-inset"
        }`}
      >
        {isDone ? (
          <Text className="text-xs font-semibold text-mineral-emerald">✓</Text>
        ) : null}
      </Pressable>

      <View className="flex-1">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text
            testID="task-title"
            className={`text-[13px] font-medium leading-snug ${
              isDone ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {entry.title}
          </Text>
          {timeText ? (
            <Text
              testID="task-time"
              className="text-[11px] font-medium text-muted-foreground"
            >
              {timeText}
            </Text>
          ) : null}
        </View>

        {entry.detail ? (
          <Text
            testID="task-detail"
            className="mt-1 text-xs text-muted-foreground leading-relaxed"
          >
            {entry.detail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
