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
import { EntrySheet } from "../entry-sheet";

// ponytail: single-month window with scroll; upgrade to multi-month windowed FlatList when infinite scroll is needed.
export function TimelineScreen() {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => isoDay(today), [today]);
  const todayIdx = useMemo(() => monthIndex(today), [today]);

  const [currentMonthIdx, setCurrentMonthIdx] = useState(todayIdx);
  const [todayY, setTodayY] = useState(0);
  // ponytail: local optimistic state; upgrade to Convex optimistic mutation if multi-screen sync needed.
  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Record<string, boolean>
  >({});
  const [sheetState, setSheetState] = useState<{
    open: boolean;
    date: string;
    entry: DayEntry | null;
  }>({
    open: false,
    date: todayKey,
    entry: null,
  });

  const handleOpenCreate = useCallback((entryDate: string) => {
    setSheetState({
      open: true,
      date: entryDate,
      entry: null,
    });
  }, []);

  const handleOpenEdit = useCallback((entry: DayEntry) => {
    setSheetState({
      open: true,
      date: entry.date,
      entry,
    });
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetState((prev) => ({ ...prev, open: false }));
  }, []);

  const year = Math.floor(currentMonthIdx / 12);
  const month = currentMonthIdx % 12;

  const entries = useQuery(listRangeQuery, {
    start: monthStartDay(currentMonthIdx),
    end: monthEndDay(currentMonthIdx),
  });

  const toggleDone = useMutation(toggleDoneMutation);

  const handleToggleDone = useCallback(
    async (id: string) => {
      const original = entries?.find((e) => e._id === id);
      const currentDone =
        id in optimisticOverrides
          ? optimisticOverrides[id]
          : Boolean(original?.done);
      const nextDone = !currentDone;

      setOptimisticOverrides((prev) => ({ ...prev, [id]: nextDone }));

      try {
        await toggleDone({ id });
      } catch {
        setOptimisticOverrides((prev) => {
          const next = { ...prev };
          if (id in optimisticOverrides) {
            next[id] = optimisticOverrides[id];
          } else {
            delete next[id];
          }
          return next;
        });
      }
    },
    [entries, optimisticOverrides, toggleDone]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const rawEntry of entries ?? []) {
      const entry =
        rawEntry._id in optimisticOverrides
          ? { ...rawEntry, done: optimisticOverrides[rawEntry._id] }
          : rawEntry;
      const list = map.get(entry.date);
      if (list) {
        list.push(entry);
      } else {
        map.set(entry.date, [entry]);
      }
    }
    return map;
  }, [entries, optimisticOverrides]);

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
        className="flex-1 items-center justify-center bg-background p-6"
      >
        <ActivityIndicator size="large" color="#f4f4f2" />
        <Text className="mt-4 text-sm text-muted-foreground">Loading timeline...</Text>
      </View>
    );
  }

  const sundays = sundaysOfMonth(year, month);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <Text className="text-base font-semibold text-foreground">Timeline</Text>
        <Pressable
          testID="today-button"
          onPress={jumpToToday}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          className="rounded-full border border-border bg-surface px-3 py-1 active:bg-surface-inset"
        >
          <Text className="text-xs font-semibold text-foreground">Today</Text>
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
            <Text className="text-base font-medium text-foreground">
              No entries yet
            </Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground">
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
                    onOpenEntry={handleOpenEdit}
                    onAddEntry={handleOpenCreate}
                    onLayout={isToday ? handleTodayLayout : undefined}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </ScrollView>

      <Pressable
        testID="timeline-fab"
        onPress={() => handleOpenCreate(todayKey)}
        accessibilityRole="button"
        accessibilityLabel="Create entry for today"
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-foreground shadow-2xl active:opacity-90"
      >
        <Text className="text-2xl font-bold text-background">+</Text>
      </Pressable>

      <EntrySheet
        open={sheetState.open}
        onClose={handleCloseSheet}
        date={sheetState.date}
        entry={sheetState.entry}
      />
    </View>
  );
}
