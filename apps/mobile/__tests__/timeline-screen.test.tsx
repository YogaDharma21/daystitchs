import React, { act } from "react";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react-native";
import { useQuery } from "convex/react";
import { TimelineScreen } from "@/components/timeline/timeline-screen";
import { isoDay, type DayEntry } from "@/lib/daystitch";
import {
  createEntryMutation,
  updateEntryMutation,
  removeEntryMutation,
} from "@/lib/entries-api";

const mockToggleDone = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();
const mockUseMutation = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: (mutation: unknown) => mockUseMutation(mutation),
}));

describe("TimelineScreen", () => {
  const today = new Date();
  const todayKey = isoDay(today);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const tomorrowKey = isoDay(tomorrow);

  const mockEntries: DayEntry[] = [
    // Deliberately put task first to verify events sort before tasks
    {
      _id: "t1",
      userId: "user_1",
      date: todayKey,
      title: "Submit PR",
      type: "task",
      time: "08:00",
      detail: "Follow TDD",
      done: false,
    },
    {
      _id: "e1",
      userId: "user_1",
      date: todayKey,
      title: "Design Review",
      type: "event",
      start: "10:00",
      end: "11:30",
      loc: "Room 101",
      detail: "Review phase 1 specs",
    },
    {
      _id: "e2",
      userId: "user_1",
      date: tomorrowKey,
      title: "Team Standup",
      type: "event",
      start: "09:00",
      end: "09:30",
      loc: "Zoom",
      detail: "Daily sync",
    },
    {
      _id: "t2",
      userId: "user_1",
      date: tomorrowKey,
      title: "Write documentation",
      type: "task",
      time: "16:00",
      detail: "Architecture notes",
      done: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue(mockEntries);
    mockToggleDone.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue("new_entry_id");
    mockUpdate.mockResolvedValue(undefined);
    mockRemove.mockResolvedValue(undefined);
    mockUseMutation.mockImplementation((mutation) => {
      if (mutation === createEntryMutation) return mockCreate;
      if (mutation === updateEntryMutation) return mockUpdate;
      if (mutation === removeEntryMutation) return mockRemove;
      return mockToggleDone;
    });
  });

  it("renders month banner with entry count", async () => {
    await render(<TimelineScreen />);

    expect(screen.getByTestId("month-banner")).toBeTruthy();
    expect(screen.getByTestId("month-title")).toBeTruthy();
    expect(screen.getByTestId("month-count")).toBeTruthy();
    expect(within(screen.getByTestId("month-count")).getByText(/4 entries/i)).toBeTruthy();
  });

  it("renders day sections, with 'Today' indicator on today's section", async () => {
    await render(<TimelineScreen />);

    const todaySection = screen.getByTestId(`day-section-${todayKey}`);
    expect(todaySection).toBeTruthy();
    expect(within(todaySection).getByTestId("today-indicator")).toBeTruthy();
    expect(within(todaySection).getByText("Today")).toBeTruthy();

    const tomorrowSection = screen.getByTestId(`day-section-${tomorrowKey}`);
    expect(tomorrowSection).toBeTruthy();
    expect(within(tomorrowSection).queryByTestId("today-indicator")).toBeNull();
  });

  it("renders events before tasks for the same day", async () => {
    await render(<TimelineScreen />);

    const todaySection = screen.getByTestId(`day-section-${todayKey}`);
    const cards = within(todaySection).getAllByTestId(/(event|task)-card/);
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText("Design Review")).toBeTruthy();
    expect(within(cards[1]).getByText("Submit PR")).toBeTruthy();
  });

  it("renders event card with time range, title, location, detail", async () => {
    await render(<TimelineScreen />);

    const eventCard = screen.getByTestId("event-card-e1");
    expect(eventCard).toBeTruthy();
    expect(within(eventCard).getByText("Design Review")).toBeTruthy();
    expect(within(eventCard).getByText(/10.*11:30.*AM/)).toBeTruthy();
    expect(within(eventCard).getByText(/Room 101/)).toBeTruthy();
    expect(within(eventCard).getByText(/Review phase 1 specs/)).toBeTruthy();
  });

  it("renders task card with title and unchecked box", async () => {
    await render(<TimelineScreen />);

    const taskCard = screen.getByTestId("task-card-t1");
    expect(taskCard).toBeTruthy();
    expect(within(taskCard).getByText("Submit PR")).toBeTruthy();

    const checkbox = within(taskCard).getByTestId("task-checkbox");
    expect(checkbox).toBeTruthy();
    expect(checkbox.props.accessibilityState?.checked).toBe(false);
  });

  it("displays 'Today' button", async () => {
    await render(<TimelineScreen />);

    const todayBtn = screen.getByTestId("today-button");
    expect(todayBtn).toBeTruthy();
  });

  it("invokes toggleDone mutation with task id when tapping task checkbox", async () => {
    await render(<TimelineScreen />);

    const taskCard = screen.getByTestId("task-card-t1");
    const checkbox = within(taskCard).getByTestId("task-checkbox");

    fireEvent.press(checkbox);

    expect(mockToggleDone).toHaveBeenCalledWith({ id: "t1" });
  });

  it("immediately shows checked state and strike-through title when tapping task checkbox", async () => {
    await render(<TimelineScreen />);

    let taskCard = screen.getByTestId("task-card-t1");
    let checkbox = within(taskCard).getByTestId("task-checkbox");
    let title = within(taskCard).getByTestId("task-title");

    expect(checkbox.props.accessibilityState?.checked).toBe(false);
    expect(title.props.className).not.toContain("line-through");

    fireEvent.press(checkbox);

    await waitFor(() => {
      taskCard = screen.getByTestId("task-card-t1");
      checkbox = within(taskCard).getByTestId("task-checkbox");
      expect(checkbox.props.accessibilityState?.checked).toBe(true);
    });

    title = within(taskCard).getByTestId("task-title");
    expect(within(checkbox).getByText("✓")).toBeTruthy();
    expect(title.props.className).toContain("line-through");
    expect(title.props.className).toContain("text-neutral-500");
  });

  it("toggles back to unchecked when tapping task checkbox again", async () => {
    await render(<TimelineScreen />);

    let taskCard = screen.getByTestId("task-card-t1");
    let checkbox = within(taskCard).getByTestId("task-checkbox");

    fireEvent.press(checkbox);

    await waitFor(() => {
      taskCard = screen.getByTestId("task-card-t1");
      checkbox = within(taskCard).getByTestId("task-checkbox");
      expect(checkbox.props.accessibilityState?.checked).toBe(true);
    });

    fireEvent.press(checkbox);

    await waitFor(() => {
      taskCard = screen.getByTestId("task-card-t1");
      checkbox = within(taskCard).getByTestId("task-checkbox");
      expect(checkbox.props.accessibilityState?.checked).toBe(false);
    });

    const title = within(taskCard).getByTestId("task-title");
    expect(within(checkbox).queryByText("✓")).toBeNull();
    expect(title.props.className).not.toContain("line-through");
  });

  it("reverts optimistic state if mutation rejects", async () => {
    mockToggleDone.mockRejectedValueOnce(new Error("Mutation failed"));

    await render(<TimelineScreen />);

    const taskCard = screen.getByTestId("task-card-t1");
    const checkbox = within(taskCard).getByTestId("task-checkbox");

    expect(checkbox.props.accessibilityState?.checked).toBe(false);

    fireEvent.press(checkbox);

    await waitFor(() => {
      const updatedCard = screen.getByTestId("task-card-t1");
      const updatedCheckbox = within(updatedCard).getByTestId("task-checkbox");
      expect(updatedCheckbox.props.accessibilityState?.checked).toBe(false);
    });

    const finalCard = screen.getByTestId("task-card-t1");
    const finalCheckbox = within(finalCard).getByTestId("task-checkbox");
    const finalTitle = within(finalCard).getByTestId("task-title");

    expect(within(finalCheckbox).queryByText("✓")).toBeNull();
    expect(finalTitle.props.className).not.toContain("line-through");
  });

  it("opens create sheet pre-filled with date when clicking day '+' button", async () => {
    await render(<TimelineScreen />);

    const tomorrowSection = screen.getByTestId(`day-section-${tomorrowKey}`);
    const addBtn = within(tomorrowSection).getByTestId("add-entry-button");

    await act(async () => {
      fireEvent.press(addBtn);
    });

    expect(screen.getByTestId("entry-sheet")).toBeTruthy();
    expect(screen.getByTestId("entry-date").props.value).toBe(tomorrowKey);
  });

  it("opens create sheet pre-filled with today when clicking FAB", async () => {
    await render(<TimelineScreen />);

    const fab = screen.getByTestId("timeline-fab");
    expect(fab).toBeTruthy();

    await act(async () => {
      fireEvent.press(fab);
    });

    expect(screen.getByTestId("entry-sheet")).toBeTruthy();
    expect(screen.getByTestId("entry-date").props.value).toBe(todayKey);
  });

  it("creates entry on valid form submission from FAB", async () => {
    await render(<TimelineScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-fab"));
    });

    await act(async () => {
      fireEvent.changeText(screen.getByTestId("entry-title"), "New FAB Task");
      fireEvent.changeText(screen.getByTestId("entry-time"), "12:00");
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockCreate).toHaveBeenCalledWith({
      date: todayKey,
      title: "New FAB Task",
      type: "task",
      time: "12:00",
    });
  });

  it("opens edit sheet when clicking entry card and fires updateEntryMutation on save", async () => {
    await render(<TimelineScreen />);

    const eventCard = screen.getByTestId("event-card-e1");

    await act(async () => {
      fireEvent.press(eventCard);
    });

    expect(screen.getByTestId("entry-sheet")).toBeTruthy();
    expect(screen.getByTestId("entry-title").props.value).toBe("Design Review");

    await act(async () => {
      fireEvent.changeText(screen.getByTestId("entry-title"), "Design Review V2");
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "e1",
        title: "Design Review V2",
      })
    );
  });

  it("fires removeEntryMutation when clicking delete in edit sheet", async () => {
    await render(<TimelineScreen />);

    const eventCard = screen.getByTestId("event-card-e1");

    await act(async () => {
      fireEvent.press(eventCard);
    });

    const deleteBtn = screen.getByTestId("entry-delete");
    expect(deleteBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    expect(mockRemove).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-delete-confirm"));
    });

    expect(mockRemove).toHaveBeenCalledWith({ id: "e1" });
  });

  it("prevents save when title is empty in timeline sheet", async () => {
    await render(<TimelineScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-fab"));
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("entry-save"));
    });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("renders filter bar with all, tasks, events, and pending chips", async () => {
    await render(<TimelineScreen />);

    expect(screen.getByTestId("timeline-filter-bar")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-all")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-tasks")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-events")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-pending")).toBeTruthy();
  });

  it("filters timeline to tasks only when tapping Tasks chip", async () => {
    await render(<TimelineScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("filter-chip-tasks"));
    });

    expect(screen.getByTestId("task-card-t1")).toBeTruthy();
    expect(screen.getByTestId("task-card-t2")).toBeTruthy();
    expect(screen.queryByTestId("event-card-e1")).toBeNull();
    expect(screen.queryByTestId("event-card-e2")).toBeNull();
  });

  it("filters timeline to events only when tapping Events chip", async () => {
    await render(<TimelineScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("filter-chip-events"));
    });

    expect(screen.getByTestId("event-card-e1")).toBeTruthy();
    expect(screen.getByTestId("event-card-e2")).toBeTruthy();
    expect(screen.queryByTestId("task-card-t1")).toBeNull();
    expect(screen.queryByTestId("task-card-t2")).toBeNull();
  });

  it("filters timeline to pending tasks only when tapping Pending chip", async () => {
    await render(<TimelineScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("filter-chip-pending"));
    });

    expect(screen.getByTestId("task-card-t1")).toBeTruthy();
    expect(screen.getByTestId("task-card-t2")).toBeTruthy();
    expect(screen.queryByTestId("event-card-e1")).toBeNull();

    const checkbox = within(screen.getByTestId("task-card-t1")).getByTestId("task-checkbox");
    await act(async () => {
      fireEvent.press(checkbox);
    });

    expect(screen.queryByTestId("task-card-t1")).toBeNull();
    expect(screen.getByTestId("task-card-t2")).toBeTruthy();
  });
});
