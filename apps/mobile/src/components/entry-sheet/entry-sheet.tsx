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
      className="flex-1 justify-end bg-black/70"
    >
      <Pressable
        testID="entry-sheet-backdrop"
        className="flex-1"
        onPress={onClose}
      />
      <View
        testID="entry-sheet"
        className="max-h-[90%] rounded-t-3xl border-t border-border bg-card px-5 pt-3 pb-8"
      >
        <View className="mb-3 h-1 w-10 self-center rounded-full bg-border-subtle" />

        <View className="flex-row items-center justify-between border-b border-border pb-3">
          <Text className="text-base font-semibold text-foreground">
            {isEdit
              ? `Edit ${draft.type === "event" ? "Event" : "Task"}`
              : `New ${draft.type === "event" ? "Event" : "Task"}`}
          </Text>
          <Pressable
            testID="entry-cancel"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            className="rounded-full border border-border bg-surface px-3 py-1 active:bg-surface-inset"
          >
            <Text className="text-xs font-medium text-muted-foreground">
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
              className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                draft.type === "task"
                  ? "border-transparent bg-foreground"
                  : "border-border bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  draft.type === "task" ? "text-background font-semibold" : "text-muted-foreground"
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
              className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                draft.type === "event"
                  ? "border-transparent bg-foreground"
                  : "border-border bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  draft.type === "event" ? "text-background font-semibold" : "text-muted-foreground"
                }`}
              >
                Event
              </Text>
            </Pressable>
          </View>

          <View className="mt-3">
            <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              Title
            </Text>
            <TextInput
              testID="entry-title"
              value={draft.title}
              onChangeText={(title) => updateDraft({ title })}
              placeholder="e.g. Project update"
              placeholderTextColor="#5f6065"
              maxLength={80}
              className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
            />
          </View>

          <View className="mt-3">
            <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              Date
            </Text>
            <TextInput
              testID="entry-date"
              value={draft.date}
              onChangeText={(dateVal) => updateDraft({ date: dateVal })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#5f6065"
              className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
            />
          </View>

          {draft.type === "event" ? (
            <>
              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Start
                  </Text>
                  <TextInput
                    testID="entry-start"
                    value={draft.start}
                    onChangeText={(start) => updateDraft({ start })}
                    placeholder="10:00"
                    placeholderTextColor="#5f6065"
                    className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    End
                  </Text>
                  <TextInput
                    testID="entry-end"
                    value={draft.end}
                    onChangeText={(end) => updateDraft({ end })}
                    placeholder="10:30"
                    placeholderTextColor="#5f6065"
                    className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                  Location
                </Text>
                <TextInput
                  testID="entry-loc"
                  value={draft.loc}
                  onChangeText={(loc) => updateDraft({ loc })}
                  placeholder="e.g. Central"
                  placeholderTextColor="#5f6065"
                  maxLength={60}
                  className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
                />
              </View>
            </>
          ) : (
            <View className="mt-3">
              <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Time (optional)
              </Text>
              <TextInput
                testID="entry-time"
                value={draft.time}
                onChangeText={(time) => updateDraft({ time })}
                placeholder="e.g. 14:00"
                placeholderTextColor="#5f6065"
                className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
              />
            </View>
          )}

          <View className="mt-3">
            <Text className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
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
              placeholderTextColor="#5f6065"
              maxLength={120}
              className="rounded-xl border border-border bg-surface-inset px-3 py-2 text-base text-foreground"
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
                    className="flex-1 items-center justify-center rounded-xl border border-border bg-surface py-3 active:bg-surface-inset"
                  >
                    <Text className="text-sm font-semibold text-muted-foreground">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="entry-delete-confirm"
                    onPress={executeDelete}
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm delete entry"
                    className="flex-1 items-center justify-center rounded-xl bg-mineral-crimson py-3 active:opacity-90"
                  >
                    <Text className="text-sm font-semibold text-background">
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
                  className="flex-1 items-center justify-center rounded-xl border border-mineral-crimson/30 bg-mineral-crimson-tint py-3 active:opacity-90"
                >
                  <Text className="text-sm font-semibold text-mineral-crimson">
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
              className={`flex-1 items-center justify-center rounded-xl py-3 ${
                Boolean(error) || saving
                  ? "bg-foreground/40"
                  : "bg-foreground active:opacity-90 shadow-xs"
              }`}
            >
              <Text className="text-sm font-semibold text-background">Save</Text>
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
