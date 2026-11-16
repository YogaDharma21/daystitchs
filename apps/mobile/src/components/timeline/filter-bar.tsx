import React from "react";
import { View, Text, Pressable } from "react-native";
import type { TimelineFilter } from "../../lib/daystitch";

interface FilterBarProps {
  selected: TimelineFilter;
  onChange: (filter: TimelineFilter) => void;
}

const FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "events", label: "Events" },
  { key: "pending", label: "Pending" },
];

export function FilterBar({ selected, onChange }: FilterBarProps) {
  return (
    <View
      testID="timeline-filter-bar"
      className="flex-row items-center gap-2 bg-neutral-950 px-4 py-2 border-b border-neutral-900"
    >
      {FILTERS.map((f) => {
        const isActive = selected === f.key;
        return (
          <Pressable
            key={f.key}
            testID={`filter-chip-${f.key}`}
            onPress={() => onChange(f.key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${f.label}`}
            accessibilityState={{ selected: isActive }}
            className={`rounded-full px-3.5 py-1.5 border ${
              isActive
                ? "bg-white border-white"
                : "bg-neutral-900 border-neutral-800 active:bg-neutral-800"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? "text-neutral-950" : "text-neutral-400"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
