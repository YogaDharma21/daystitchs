import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  type LayoutChangeEvent,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import {
  daysOfWeek,
  isoDay,
  monthEndDay,
  monthIndex,
  monthStartDay,
  sundaysOfMonth,
  type DayEntry,
} from "../../lib/daystitch";
import { listRangeQuery, toggleDoneMutation } from "../../lib/entries-api";
import { MonthBanner } from "./month-banner";
import { WeekHeader } from "./week-header";
import { DaySection } from "./day-section";

// ponytail: single-month window with scroll; upgrade to multi-month windowed FlatList when infinite scroll is needed.
export function TimelineScreen() {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => isoDay(today), [today]);
  const todayIdx = useMemo(() => monthIndex(today), [today]);

  const [currentMonthIdx, setCurrentMonthIdx] = useState(todayIdx);
  const [todayY, setTodayY] = useState(0);

  const year = Math.floor(currentMonthIdx / 12);
  const month = currentMonthIdx % 12;

  const entries = useQuery(listRangeQuery, {
    start: monthStartDay(currentMonthIdx),
    end: monthEndDay(currentMonthIdx),
  });

  const toggleDone = useMutation(toggleDoneMutation);

  const handleToggleDone = useCallback(
    (id: string) => {
      void toggleDone({ id });
    },
    [toggleDone]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const entry of entries ?? []) {
      const list = map.get(entry.date);
      if (list) {
        list.push(entry);
      } else {
        map.set(entry.date, [entry]);
      }
    }
    return map;
  }, [entries]);

  const jumpToToday = useCallback(() => {
    if (currentMonthIdx !== todayIdx) {
      setCurrentMonthIdx(todayIdx);
    }
    scrollViewRef.current?.scrollTo({ y: todayY, animated: true });
  }, [currentMonthIdx, todayIdx, todayY]);

  const handleTodayLayout = useCallback((e: LayoutChangeEvent) => {
    setTodayY(e.nativeEvent.layout.y);
  }, []);

  if (entries === undefined) {
    return (
      <View
        testID="timeline-loading"
        className="flex-1 items-center justify-center bg-black p-6"
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-sm text-neutral-400">Loading timeline...</Text>
      </View>
    );
  }

  const sundays = sundaysOfMonth(year, month);

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-2.5">
        <Text className="text-base font-semibold text-white">Timeline</Text>
        <Pressable
          testID="today-button"
          onPress={jumpToToday}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          className="rounded-full bg-blue-600 px-3 py-1 active:bg-blue-700"
        >
          <Text className="text-xs font-bold text-white">Today</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <MonthBanner year={year} month={month} count={entries.length} />

        {entries.length === 0 ? (
          <View testID="timeline-empty" className="p-8 items-center justify-center">
            <Text className="text-base font-medium text-neutral-300">
              No entries yet
            </Text>
            <Text className="mt-1 text-center text-xs text-neutral-500">
              Your timeline for this month is empty.
            </Text>
          </View>
        ) : null}

        {sundays.map((sun) => {
          const sunKey = isoDay(sun);
          const days = daysOfWeek(sun);
          const hits = days.filter((d) => {
            const k = isoDay(d);
            return k === todayKey || byDate.has(k);
          });

          if (hits.length === 0) {
            return null;
          }

          const weekCount = hits.reduce(
            (acc, d) => acc + (byDate.get(isoDay(d))?.length ?? 0),
            0
          );

          return (
            <React.Fragment key={sunKey}>
              <WeekHeader sun={sun} count={weekCount} />
              {hits.map((d) => {
                const k = isoDay(d);
                const isToday = k === todayKey;
                return (
                  <DaySection
                    key={k}
                    day={d}
                    todayKey={todayKey}
                    entries={byDate.get(k) ?? []}
                    onToggleDone={handleToggleDone}
                    onLayout={isToday ? handleTodayLayout : undefined}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}
