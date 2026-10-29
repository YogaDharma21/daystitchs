import React, { act } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react-native";
import { NowNextBar } from "@/components/timeline/now-next-bar";
import type { DayEntry } from "@/lib/daystitch";

describe("NowNextBar mobile component", () => {
  const onSelectEntry = jest.fn();
  const onToggleDone = jest.fn();

  const testDate = new Date(2026, 9, 29, 14, 15); // 14:15 on Oct 29, 2026

  const mockEntries: DayEntry[] = [
    {
      _id: "e1",
      userId: "u1",
      date: "2026-10-29",
      title: "Sprint Planning",
      type: "event",
      start: "14:00",
      end: "15:00",
      loc: "Zoom",
    },
    {
      _id: "t1",
      userId: "u1",
      date: "2026-10-29",
      title: "Deploy build",
      type: "task",
      time: "14:45",
      done: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders active event and immediate next task with correct data", async () => {
    await render(
      <NowNextBar
        entries={mockEntries}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    );

    expect(screen.getByTestId("now-next-widget")).toBeTruthy();
    expect(screen.getByText("Sprint Planning")).toBeTruthy();
    expect(screen.getByText("Deploy build")).toBeTruthy();
  });

  it("calls onSelectEntry when pressing now or next item", async () => {
    await render(
      <NowNextBar
        entries={mockEntries}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("now-entry-btn"));
    });
    expect(onSelectEntry).toHaveBeenCalledWith(mockEntries[0]);

    await act(async () => {
      fireEvent.press(screen.getByTestId("next-entry-btn"));
    });
    expect(onSelectEntry).toHaveBeenCalledWith(mockEntries[1]);
  });

  it("calls onToggleDone when pressing the checkbox on next task", async () => {
    await render(
      <NowNextBar
        entries={mockEntries}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("now-next-toggle-done"));
    });
    expect(onToggleDone).toHaveBeenCalledWith("t1");
  });

  it("renders idle states when no events are active and no tasks are pending", async () => {
    await render(
      <NowNextBar
        entries={[]}
        onSelectEntry={onSelectEntry}
        onToggleDone={onToggleDone}
        nowDate={testDate}
      />
    );

    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.getByText("No pending tasks")).toBeTruthy();
  });
});
