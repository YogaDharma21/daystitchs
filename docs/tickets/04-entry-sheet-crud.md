Part of #11

## Parent

#11

## What to build

A modal bottom sheet interface for creating, editing, and deleting timeline entries.
Users can open the sheet in create mode from the "+" button on any day section or the global floating action button.
The form provides a segmented switch between Task and Event modes with type-specific inputs (start/end time and location for events; optional deadline time for tasks).
Enforces backend character limits: title (max 80), location (max 60), detail (max 120).
Submitting creates the entry via Convex `create` mutation and reflects on the timeline.
Tapping any entry card on the timeline opens the sheet in edit mode pre-populated with its values.
Saving edits calls the Convex `update` mutation.
In edit mode, a delete button allows removing the entry after a confirmation prompt via Convex `remove` mutation.

## Acceptance criteria

- [ ] Day "+" button opens create sheet pre-filled with that day's date
- [ ] Global FAB opens create sheet pre-filled with today's date
- [ ] Segmented toggle switches form fields between Event and Task
- [ ] Enforces character limits and validates non-empty title before saving
- [ ] Saving new entry calls Convex `create` mutation
- [ ] Tapping card opens sheet in edit mode with current data
- [ ] Saving modified entry calls Convex `update` mutation
- [ ] Delete button with confirmation prompt calls Convex `remove` mutation
- [ ] Screen integration tests verify create, edit, delete validation and mutation calls

## Blocked by

- #14
