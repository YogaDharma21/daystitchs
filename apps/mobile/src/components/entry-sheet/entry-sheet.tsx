import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMutation } from "convex/react";
import {
  validateEntryDraft,
  type DayEntry,
  type EntryType,
} from "../../lib/daystitch";
import {
  createEntryMutation,
  removeEntryMutation,
  updateEntryMutation,
  type CreateEntryArgs,
} from "../../lib/entries-api";

export interface EntrySheetProps {
  open: boolean;
  onClose: () => void;
  date: string;
  entry: DayEntry | null;
  preset?: EntryType;
}

export function EntrySheet({
  open,
  onClose,
  date,
  entry,
  preset = "task",
}: EntrySheetProps) {
  const create = useMutation(createEntryMutation);
  const update = useMutation(updateEntryMutation);
  const remove = useMutation(removeEntryMutation);

  const [type, setType] = useState<EntryType>(entry?.type ?? preset);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [day, setDay] = useState(entry?.date ?? date);
  const [start, setStart] = useState(entry?.start ?? "10:00");
  const [end, setEnd] = useState(entry?.end ?? "10:30");
  const [time, setTime] = useState(entry?.time ?? "");
  const [loc, setLoc] = useState(entry?.loc ?? "");
  const [detail, setDetail] = useState(entry?.detail ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(entry?.type ?? preset);
    setTitle(entry?.title ?? "");
    setDay(entry?.date ?? date);
    setStart(entry?.start ?? "10:00");
    setEnd(entry?.end ?? "10:30");
    setTime(entry?.time ?? "");
    setLoc(entry?.loc ?? "");
    setDetail(entry?.detail ?? "");
    setSaving(false);
  }, [open, entry, date, preset]);

  const draft = { title, date: day, type, start, end, time, loc, detail };
  const error = validateEntryDraft(draft);
  const isEdit = entry !== null;

  const onSave = () => {
    if (error || saving) return;
    setSaving(true);

    const payload: CreateEntryArgs = {
      date: day,
      title: title.trim(),
      type,
    };
    if (type === "event") {
      if (start) payload.start = start;
      if (end) payload.end = end;
      if (loc.trim()) payload.loc = loc.trim();
    } else if (time) {
      payload.time = time;
    }
    if (detail.trim()) payload.detail = detail.trim();

    const saved =
      isEdit && entry
        ? update({ ...payload, id: entry._id })
        : create(payload);
    void saved.then(
      () => onClose(),
      () => setSaving(false)
    );
  };

  // ponytail: direct delete without confirmation dialog; upgrade to Alert.alert if accidental deletes occur.
  const onDelete = () => {
    if (!entry || saving) return;
    setSaving(true);
    void remove({ id: entry._id }).then(
      () => onClose(),
      () => setSaving(false)
    );
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <Pressable
          testID="entry-sheet-backdrop"
          className="flex-1"
          onPress={onClose}
        />
        <View
          testID="entry-sheet"
          className="max-h-[90%] rounded-t-3xl border-t border-neutral-800 bg-neutral-900 px-5 pt-3 pb-8"
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-neutral-700" />

          <View className="flex-row items-center justify-between border-b border-neutral-800 pb-3">
            <Text className="text-lg font-bold text-white">
              {isEdit
                ? `Edit ${type === "event" ? "Event" : "Task"}`
                : `New ${type === "event" ? "Event" : "Task"}`}
            </Text>
            <Pressable
              testID="entry-cancel"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="rounded-full bg-neutral-800 px-3 py-1 active:bg-neutral-700"
            >
              <Text className="text-xs font-semibold text-neutral-300">
                Cancel
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mt-4 flex-row gap-2">
              <Pressable
                testID="entry-type-task"
                onPress={() => setType("task")}
                accessibilityRole="button"
                accessibilityState={{ selected: type === "task" }}
                className={`flex-1 items-center justify-center rounded-lg border py-2 ${
                  type === "task"
                    ? "border-blue-500 bg-blue-600"
                    : "border-neutral-700 bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    type === "task" ? "text-white" : "text-neutral-400"
                  }`}
                >
                  Task
                </Text>
              </Pressable>
              <Pressable
                testID="entry-type-event"
                onPress={() => setType("event")}
                accessibilityRole="button"
                accessibilityState={{ selected: type === "event" }}
                className={`flex-1 items-center justify-center rounded-lg border py-2 ${
                  type === "event"
                    ? "border-blue-500 bg-blue-600"
                    : "border-neutral-700 bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    type === "event" ? "text-white" : "text-neutral-400"
                  }`}
                >
                  Event
                </Text>
              </Pressable>
            </View>

            <View className="mt-3">
              <Text className="mb-1 text-xs font-semibold text-neutral-400">
                Title
              </Text>
              <TextInput
                testID="entry-title"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Project update"
                placeholderTextColor="#737373"
                maxLength={80}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
              />
            </View>

            <View className="mt-3">
              <Text className="mb-1 text-xs font-semibold text-neutral-400">
                Date
              </Text>
              <TextInput
                testID="entry-date"
                value={day}
                onChangeText={setDay}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#737373"
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
              />
            </View>

            {type === "event" ? (
              <>
                <View className="mt-3 flex-row gap-2">
                  <View className="flex-1">
                    <Text className="mb-1 text-xs font-semibold text-neutral-400">
                      Start
                    </Text>
                    <TextInput
                      testID="entry-start"
                      value={start}
                      onChangeText={setStart}
                      placeholder="10:00"
                      placeholderTextColor="#737373"
                      className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xs font-semibold text-neutral-400">
                      End
                    </Text>
                    <TextInput
                      testID="entry-end"
                      value={end}
                      onChangeText={setEnd}
                      placeholder="10:30"
                      placeholderTextColor="#737373"
                      className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
                    />
                  </View>
                </View>

                <View className="mt-3">
                  <Text className="mb-1 text-xs font-semibold text-neutral-400">
                    Location
                  </Text>
                  <TextInput
                    testID="entry-loc"
                    value={loc}
                    onChangeText={setLoc}
                    placeholder="e.g. Central"
                    placeholderTextColor="#737373"
                    maxLength={60}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
                  />
                </View>
              </>
            ) : (
              <View className="mt-3">
                <Text className="mb-1 text-xs font-semibold text-neutral-400">
                  Time (optional)
                </Text>
                <TextInput
                  testID="entry-time"
                  value={time}
                  onChangeText={setTime}
                  placeholder="e.g. 14:00"
                  placeholderTextColor="#737373"
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
                />
              </View>
            )}

            <View className="mt-3">
              <Text className="mb-1 text-xs font-semibold text-neutral-400">
                Detail
              </Text>
              <TextInput
                testID="entry-detail"
                value={detail}
                onChangeText={setDetail}
                placeholder={
                  type === "event"
                    ? "e.g. Agenda, links, notes"
                    : "e.g. Bring slides"
                }
                placeholderTextColor="#737373"
                maxLength={120}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
              />
            </View>

            <View className="mt-5 flex-row gap-3">
              {isEdit ? (
                <Pressable
                  testID="entry-delete"
                  onPress={onDelete}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Delete entry"
                  className="flex-1 items-center justify-center rounded-lg bg-red-600 py-3 active:bg-red-700"
                >
                  <Text className="text-base font-semibold text-white">
                    Delete
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                testID="entry-save"
                onPress={onSave}
                disabled={Boolean(error) || saving}
                accessibilityRole="button"
                accessibilityLabel="Save entry"
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  Boolean(error) || saving
                    ? "bg-blue-600/50"
                    : "bg-blue-600 active:bg-blue-700"
                }`}
              >
                <Text className="text-base font-semibold text-white">Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
