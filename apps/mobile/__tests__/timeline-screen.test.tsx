import React from "react";
import { render, screen, within } from "@testing-library/react-native";
import { useQuery } from "convex/react";
import { TimelineScreen } from "@/components/timeline/timeline-screen";
import { isoDay, type DayEntry } from "@/lib/daystitch";

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(() => jest.fn()),
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
});
