Part of #11

## Parent

#11

## What to build

Direct one-tap completion toggle on Task cards in the timeline.
When a user taps the checkbox on any task card, the app optimistically updates the visual state to completed or active and fires the Convex `toggleDone` mutation.
Done tasks are styled with strike-through text and muted colors.
Tapping again reverts the task to active.
Events do not display checkboxes and cannot be toggled.

## Acceptance criteria

- [ ] Tapping task checkbox invokes Convex `toggleDone` mutation with task ID
- [ ] Visual state updates immediately (optimistic UI feedback)
- [ ] Completed tasks display strike-through title and muted foreground color
- [ ] Completed tasks can be toggled back to pending
- [ ] Screen integration tests verify toggle interaction and mutation invocation

## Blocked by

- #13
