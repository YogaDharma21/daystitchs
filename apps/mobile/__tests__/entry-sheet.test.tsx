import React, { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { EntrySheet } from "@/components/entry-sheet/entry-sheet";
import {
  createEntryMutation,
  updateEntryMutation,
  removeEntryMutation,
} from "@/lib/entries-api";
import type { DayEntry } from "@/lib/daystitch";

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();
const mockUseMutation = jest.fn();

jest.mock("convex/react", () => ({
  useMutation: (mutation: unknown) => mockUseMutation(mutation),
}));

describe("EntrySheet", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue("entry_1");
    mockUpdate.mockResolvedValue(undefined);
    mockRemove.mockResolvedValue(undefined);
    mockUseMutation.mockImplementation((mutation) => {
      if (mutation === createEntryMutation) return mockCreate;
      if (mutation === updateEntryMutation) return mockUpdate;
      if (mutation === removeEntryMutation) return mockRemove;
      return jest.fn();
    });
  });

  it("renders create form when open", async () => {
    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={null}
        preset="task"
      />
    );

    expect(screen.getByTestId("entry-title")).toBeTruthy();
    expect(screen.getByTestId("entry-date").props.value).toBe("2026-10-23");
    expect(screen.getByTestId("entry-type-task")).toBeTruthy();
    expect(screen.getByTestId("entry-type-event")).toBeTruthy();
    expect(screen.getByTestId("entry-time")).toBeTruthy();
    expect(screen.getByTestId("entry-detail")).toBeTruthy();
    expect(screen.getByTestId("entry-save")).toBeTruthy();
    expect(screen.getByTestId("entry-cancel")).toBeTruthy();
    expect(screen.queryByTestId("entry-delete")).toBeNull();
  });

  it("switches to event fields when tapping event type button", async () => {
    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={null}
        preset="task"
      />
    );

    expect(screen.queryByTestId("entry-start")).toBeNull();
    expect(screen.queryByTestId("entry-end")).toBeNull();
    expect(screen.queryByTestId("entry-loc")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-type-event"));
    });

    expect(screen.getByTestId("entry-start")).toBeTruthy();
    expect(screen.getByTestId("entry-end")).toBeTruthy();
    expect(screen.getByTestId("entry-loc")).toBeTruthy();
    expect(screen.queryByTestId("entry-time")).toBeNull();
  });

  it("prevents save when title is empty", async () => {
    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={null}
      />
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("submits valid create form and fires createEntryMutation", async () => {
    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={null}
        preset="task"
      />
    );

    await act(async () => {
      fireEvent.changeText(screen.getByTestId("entry-title"), "Write tests");
      fireEvent.changeText(screen.getByTestId("entry-time"), "14:00");
      fireEvent.changeText(screen.getByTestId("entry-detail"), "Cover all cases");
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockCreate).toHaveBeenCalledWith({
      date: "2026-10-23",
      title: "Write tests",
      type: "task",
      time: "14:00",
      detail: "Cover all cases",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("submits valid event form with start, end, loc", async () => {
    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={null}
        preset="event"
      />
    );

    await act(async () => {
      fireEvent.changeText(screen.getByTestId("entry-title"), "Team Sync");
      fireEvent.changeText(screen.getByTestId("entry-start"), "10:00");
      fireEvent.changeText(screen.getByTestId("entry-end"), "11:00");
      fireEvent.changeText(screen.getByTestId("entry-loc"), "Meeting Room A");
      fireEvent.changeText(screen.getByTestId("entry-detail"), "Quarterly planning");
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockCreate).toHaveBeenCalledWith({
      date: "2026-10-23",
      title: "Team Sync",
      type: "event",
      start: "10:00",
      end: "11:00",
      loc: "Meeting Room A",
      detail: "Quarterly planning",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders edit form pre-filled and fires updateEntryMutation on save", async () => {
    const entry: DayEntry = {
      _id: "e1",
      userId: "u1",
      date: "2026-10-23",
      title: "Design Review",
      type: "event",
      start: "10:00",
      end: "11:30",
      loc: "Room 101",
      detail: "Specs",
    };

    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={entry}
      />
    );

    expect(screen.getByTestId("entry-title").props.value).toBe("Design Review");
    expect(screen.getByTestId("entry-loc").props.value).toBe("Room 101");
    expect(screen.getByTestId("entry-delete")).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(screen.getByTestId("entry-title"), "Updated Design Review");
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      id: "e1",
      date: "2026-10-23",
      title: "Updated Design Review",
      type: "event",
      start: "10:00",
      end: "11:30",
      loc: "Room 101",
      detail: "Specs",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("fires removeEntryMutation when clicking delete in edit mode", async () => {
    const entry: DayEntry = {
      _id: "e1",
      userId: "u1",
      date: "2026-10-23",
      title: "Design Review",
      type: "event",
    };

    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={entry}
      />
    );

    const deleteBtn = screen.getByTestId("entry-delete");
    expect(deleteBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    expect(mockRemove).toHaveBeenCalledWith({ id: "e1" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when cancel is pressed", async () => {
    await render(
      <EntrySheet
        open={true}
        onClose={onClose}
        date="2026-10-23"
        entry={null}
      />
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-cancel"));
    });

    expect(onClose).toHaveBeenCalled();
  });
});
