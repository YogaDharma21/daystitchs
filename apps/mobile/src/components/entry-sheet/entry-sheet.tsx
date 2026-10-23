import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useMutation } from "convex/react";
import {
  validateEntryDraft,
  type DayEntry,
  type EntryDraft,
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

function initDraft(
  entry: DayEntry | null,
  date: string,
  preset: EntryType = "task"
): EntryDraft {
  return {
    type: entry?.type ?? preset,
    title: entry?.title ?? "",
    date: entry?.date ?? date,
    start: entry?.start ?? "10:00",
    end: entry?.end ?? "10:30",
    time: entry?.time ?? "",
    loc: entry?.loc ?? "",
    detail: entry?.detail ?? "",
  };
}

function EntrySheetContent({
  onClose,
  date,
  entry,
  preset = "task",
}: Omit<EntrySheetProps, "open">) {
  const create = useMutation(createEntryMutation);
  const update = useMutation(updateEntryMutation);
  const remove = useMutation(removeEntryMutation);

  const [draft, setDraft] = useState<EntryDraft>(() =>
    initDraft(entry, date, preset)
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateDraft = (patch: Partial<EntryDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const error = validateEntryDraft(draft);
  const isEdit = entry !== null;

  const onSave = () => {
    if (error || saving) return;
    setSaving(true);

    const payload: CreateEntryArgs = {
      date: draft.date,
      title: draft.title.trim(),
      type: draft.type,
    };
    if (draft.type === "event") {
      if (draft.start) payload.start = draft.start;
      if (draft.end) payload.end = draft.end;
      if (draft.loc?.trim()) payload.loc = draft.loc.trim();
    } else if (draft.time) {
      payload.time = draft.time;
    }
    if (draft.detail?.trim()) payload.detail = draft.detail.trim();

    const saved =
      isEdit && entry
        ? update({ ...payload, id: entry._id })
        : create(payload);
    void saved.then(
      () => onClose(),
      () => setSaving(false)
    );
  };

  const executeDelete = () => {
    if (!entry || saving) return;
    setSaving(true);
    void remove({ id: entry._id }).then(
      () => onClose(),
      () => setSaving(false)
    );
  };

  const onRequestDelete = () => {
    if (!entry || saving) return;
    if (Platform.OS === "web" || process.env.NODE_ENV === "test") {
      setConfirmDelete(true);
      return;
    }
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: executeDelete },
      ]
    );
  };

  return (
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
              ? `Edit ${draft.type === "event" ? "Event" : "Task"}`
              : `New ${draft.type === "event" ? "Event" : "Task"}`}
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
              onPress={() => updateDraft({ type: "task" })}
              accessibilityRole="button"
              accessibilityState={{ selected: draft.type === "task" }}
              className={`flex-1 items-center justify-center rounded-lg border py-2 ${
                draft.type === "task"
                  ? "border-blue-500 bg-blue-600"
                  : "border-neutral-700 bg-neutral-800"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  draft.type === "task" ? "text-white" : "text-neutral-400"
                }`}
              >
                Task
              </Text>
            </Pressable>
            <Pressable
              testID="entry-type-event"
              onPress={() => updateDraft({ type: "event" })}
              accessibilityRole="button"
              accessibilityState={{ selected: draft.type === "event" }}
              className={`flex-1 items-center justify-center rounded-lg border py-2 ${
                draft.type === "event"
                  ? "border-blue-500 bg-blue-600"
                  : "border-neutral-700 bg-neutral-800"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  draft.type === "event" ? "text-white" : "text-neutral-400"
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
              value={draft.title}
              onChangeText={(title) => updateDraft({ title })}
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
              value={draft.date}
              onChangeText={(dateVal) => updateDraft({ date: dateVal })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#737373"
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-base text-white"
            />
          </View>

          {draft.type === "event" ? (
            <>
              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-semibold text-neutral-400">
                    Start
                  </Text>
                  <TextInput
                    testID="entry-start"
                    value={draft.start}
                    onChangeText={(start) => updateDraft({ start })}
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
                    value={draft.end}
                    onChangeText={(end) => updateDraft({ end })}
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
                  value={draft.loc}
                  onChangeText={(loc) => updateDraft({ loc })}
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
                value={draft.time}
                onChangeText={(time) => updateDraft({ time })}
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
              value={draft.detail}
              onChangeText={(detail) => updateDraft({ detail })}
              placeholder={
                draft.type === "event"
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
              confirmDelete ? (
                <View className="flex-1 flex-row gap-2">
                  <Pressable
                    testID="entry-delete-cancel"
                    onPress={() => setConfirmDelete(false)}
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel delete"
                    className="flex-1 items-center justify-center rounded-lg bg-neutral-800 py-3 active:bg-neutral-700"
                  >
                    <Text className="text-sm font-semibold text-neutral-300">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="entry-delete-confirm"
                    onPress={executeDelete}
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm delete entry"
                    className="flex-1 items-center justify-center rounded-lg bg-red-600 py-3 active:bg-red-700"
                  >
                    <Text className="text-sm font-semibold text-white">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  testID="entry-delete"
                  onPress={onRequestDelete}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Delete entry"
                  className="flex-1 items-center justify-center rounded-lg bg-red-600/20 border border-red-500/40 py-3 active:bg-red-600/30"
                >
                  <Text className="text-base font-semibold text-red-400">
                    Delete
                  </Text>
                </Pressable>
              )
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
  );
}

export function EntrySheet({
  open,
  onClose,
  date,
  entry,
  preset = "task",
}: EntrySheetProps) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {open ? (
        <EntrySheetContent
          key={`${entry?._id ?? "new"}-${date}-${preset}`}
          onClose={onClose}
          date={date}
          entry={entry}
          preset={preset}
        />
      ) : null}
    </Modal>
  );
}
