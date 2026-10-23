## Problem Statement

Users of DayStitch rely on the web application to organize their daily schedule with events and tasks. However, when away from their desk, accessing DayStitch via a mobile browser lacks the speed, ergonomics, offline responsiveness, and touch-first interactions of a native app. Users need a mobile app on their phone that provides immediate access to their daily timeline, lets them tick off tasks with a single tap, and enables quick capture of new events and tasks on the go.

## Solution

A native mobile client built with Expo, Expo Router, and NativeWind that connects directly to the existing DayStitch Convex backend and Clerk authentication service. The mobile client presents a fluid, touch-optimized timeline grouped by month, week, and day, allows one-tap task completion toggling, provides a modal bottom sheet for creating, editing, and deleting entries, and offers jump-to-today navigation.

## User Stories

1. As a user on mobile, I want to authenticate securely with my existing DayStitch account, so that all my entries stay synchronized between web and mobile.
2. As a user on mobile, I want to stay signed in securely across app restarts, so that I do not have to enter my credentials every time I open the app.
3. As a user on mobile, I want to see a clear loading screen while my session and data initialize, so that the app feels responsive and stable.
4. As an unauthenticated user, I want to see a sign-in screen, so that I can log in to access my private planner data.
5. As a user, I want to view my planner entries in a continuous vertical timeline, so that I can see my upcoming and past schedule in chronological order.
6. As a user, I want entries to be grouped by Month, Week, and Day, so that my schedule is structured and easy to scan.
7. As a user, I want each Month section to display the month name, year, and the total count of entries, so that I understand my monthly workload.
8. As a user, I want each Week section to show the Sunday date range, so that I can see the weekly boundaries.
9. As a user, I want each Day section to display the day of the week, calendar date, and relative indicators (such as Today), so that I know where I am in time.
10. As a user, I want events to appear before tasks on any given day, so that fixed-time appointments take visual priority.
11. As a user, I want timed items to sort chronologically, so that my schedule reads in the order it happens.
12. As a user, I want an Event card to show its title, time range, location, and optional details, so that I have all information needed for meetings and appointments.
13. As a user, I want a Task card to show its title, optional time, optional detail, and completion checkbox, so that I can track what needs doing.
14. As a user, I want to tap a task's checkbox directly on the timeline, so that I can mark it done or undone with immediate feedback.
15. As a user, I want done tasks to display with strike-through styling and muted colors, so that I can distinguish finished tasks from pending ones.
16. As a user, I want to tap any entry card on the timeline, so that I can open its details in an edit sheet.
17. As a user, I want to tap an add button on any specific day header, so that I can create a new entry pre-filled with that date.
18. As a user, I want a persistent floating action button for quick capture, so that I can add an entry for today from anywhere on the screen.
19. As a user, I want to switch between creating a Task or an Event inside the entry sheet, so that the form displays only the fields relevant to that type.
20. As a user, I want an Event form to provide fields for start time, end time, and location, so that I can schedule meetings accurately.
21. As a user, I want a Task form to provide an optional single time field, so that I can set a specific deadline time if needed.
22. As a user, I want the entry form to enforce character limits (80 for title, 60 for location, 120 for detail), so that my data remains consistent with backend rules.
23. As a user, I want the entry form to prevent saving when the title is empty or required fields are invalid, so that I don't accidentally create broken records.
24. As a user, I want a delete button when editing an existing entry, so that I can remove cancelled items from my schedule.
25. As a user, I want a confirmation step before deleting an entry, so that I do not accidentally delete important plans.
26. As a user, I want a Jump to Today button, so that I can instantly scroll back to current date after browsing past or future dates.
27. As a user, I want scrolling up and down the timeline to load adjacent months smoothly, so that I can review past history or plan future months without pagination friction.
28. As a user, I want the app to respect my device's dark or light theme settings, so that the interface matches my system preference comfortably.

## Implementation Decisions

- **Framework & Navigation**: Use Expo SDK 58 with Expo Router. Route screens live in the router directory, with app-level layout handling themes and auth providers.
- **Styling Architecture**: Use NativeWind for utility-first styling consistent with modern React Native best practices.
- **Code Organization & Boundaries**: Keep the mobile application self-contained in its workspace. Domain date manipulation helpers, formatting functions, and Convex query/mutation re-exports live locally within the mobile project to maintain independence from the web application.
- **Authentication**: Integrate Clerk authentication with secure credential storage via native platform keychain mechanisms. Wrap the app with a unified Convex-Clerk provider that supplies user identity tokens to backend queries and mutations.
- **Data Fetching Seam**: Connect to the existing Convex deployment using client query subscriptions for date range queries (`listRange`), optimistic/direct mutations for toggling completion (`toggleDone`), creating entries (`create`), modifying entries (`update`), and deleting entries (`remove`).
- **Timeline Virtualization**: Implement timeline rendering using React Native virtualized list primitives (`FlatList`), windowing entries by month range to maintain 60fps scrolling and predictable memory usage.
- **Form & Input Presentation**: Present creation and editing workflows in a native modal sheet overlay. Use native date and time picker affordances adapted for mobile touch interaction rather than raw text inputs.
- **Theme Support**: Implement a theme tokens layer supporting dark and light modes, defaulting to forced dark mode consistent with the web application aesthetics or matching the system setting.

## Testing Decisions

- **Testing Principles**: Test only external user-observable behavior and contracts at the highest viable boundary. Do not test component internals, private state, or style declarations.
- **Primary Test Seam**: Screen integration test harness using `@testing-library/react-native`. Wrap the timeline screen in mock Convex and Clerk context providers to exercise:
  - Initial timeline rendering given a set of query items across multiple dates.
  - Tapping the task completion checkmark invokes `toggleDone` mutation with the corresponding task ID.
  - Tapping the add button opens the entry sheet; filling valid fields and saving calls `create` mutation with the correct schema payload.
  - Opening an existing entry, updating its title, and saving calls `update` mutation with the ID and modified fields.
  - Deleting an entry calls `remove` mutation with the entry ID.
- **Prior Art**: Web timeline integration tests and standard React Native Testing Library harness patterns.

## Out of Scope

- Global full-text search dialog (Cmd+K desktop counterpart) is deferred to Phase 2.
- Calendar month-grid header jump popover is deferred to Phase 2.
- Offline-first local SQLite caching and sync engine.
- Push notifications and background sync alarms.
- Native calendar (iOS EventKit / Android CalendarProvider) synchronization.

## Further Notes

- Configuration requires `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variables.
- Uses identical backend validation rules as web: title maximum 80 characters, location maximum 60 characters, detail maximum 120 characters, ISO date format `YYYY-MM-DD`.
