import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import {
  fmtRange,
  getNowAndNext,
  type DayEntry,
} from "../../lib/daystitch";

export interface NowNextBarProps {
  entries: DayEntry[];
  onSelectEntry: (entry: DayEntry) => void;
  onToggleDone: (id: DayEntry["_id"]) => void;
  nowDate?: Date;
}

function useCurrentTime(overrideDate?: Date): Date {
  const [time, setTime] = useState<Date>(() => overrideDate ?? new Date());

  useEffect(() => {
    if (overrideDate) return;
    const timer = setInterval(() => {
      setTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, [overrideDate]);

  return overrideDate ?? time;
}

export function NowNextBar({
  entries,
  onSelectEntry,
  onToggleDone,
  nowDate,
}: NowNextBarProps) {
  const currentNow = useCurrentTime(nowDate);
  const { now, next } = useMemo(
    () => getNowAndNext(entries, currentNow),
    [entries, currentNow]
  );

  return (
    <View
      testID="now-next-widget"
      className="border-b border-neutral-800 bg-neutral-950 px-4 py-2"
    >
      <View className="gap-1.5">
        {/* NOW ROW */}
        <View className="flex-row items-center gap-2">
          <View className="rounded px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/40">
            <Text className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">
              Now
            </Text>
          </View>
          {now ? (
            <Pressable
              testID="now-entry-btn"
              onPress={() => onSelectEntry(now)}
              accessibilityRole="button"
              accessibilityLabel={`Now: ${now.title}`}
              className="flex-1 flex-row items-center gap-1.5 active:opacity-70"
            >
              <Text
                numberOfLines={1}
                className="flex-shrink font-medium text-xs text-white"
              >
                {now.title}
              </Text>
              <Text className="flex-shrink-0 text-xs text-neutral-400">
                {fmtRange(now)}
              </Text>
            </Pressable>
          ) : (
            <Text className="text-xs text-neutral-500">Free</Text>
          )}
        </View>

        {/* NEXT ROW */}
        <View className="flex-row items-center gap-2">
          <View className="rounded px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-800/40">
            <Text className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
              Next
            </Text>
          </View>
          {next ? (
            <View className="flex-1 flex-row items-center gap-2">
              <Pressable
                testID="now-next-toggle-done"
                onPress={() => onToggleDone(next._id)}
                accessibilityRole="checkbox"
                accessibilityLabel={`Mark ${next.title} done`}
                accessibilityState={{ checked: false }}
                className="h-4 w-4 rounded border border-neutral-700 bg-neutral-900 items-center justify-center active:border-white"
              />
              <Pressable
                testID="next-entry-btn"
                onPress={() => onSelectEntry(next)}
                accessibilityRole="button"
                accessibilityLabel={`Next: ${next.title}`}
                className="flex-1 flex-row items-center gap-1.5 active:opacity-70"
              >
                <Text
                  numberOfLines={1}
                  className="flex-shrink font-medium text-xs text-white"
                >
                  {next.title}
                </Text>
                {next.time ? (
                  <Text className="flex-shrink-0 text-xs text-neutral-400">
                    {fmtRange(next)}
                  </Text>
                ) : null}
              </Pressable>
            </View>
          ) : (
            <Text className="text-xs text-neutral-500">No pending tasks</Text>
          )}
        </View>
      </View>
    </View>
  );
}
