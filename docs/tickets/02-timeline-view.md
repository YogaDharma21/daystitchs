Part of #11

## Parent

#11

## What to build

A continuous vertical timeline screen for authenticated users displaying planner entries queried from Convex `listRange`.
Entries are organized into month banners (displaying month name, year, and entry count), collapsible Sunday-week headers, and day sections.
Each day section displays the day name, date, and "Today" indicator where applicable.
Renders Event cards showing title, time range, location, and optional details.
Renders Task cards showing title, optional deadline time, details, and pending checkbox.
Events sort before tasks, and timed entries sort chronologically.
Includes a jump-to-today button to quickly navigate back to the current date.

## Acceptance criteria

- [ ] Timeline queries Convex `listRange` for visible date range
- [ ] Entries are grouped hierarchically into Month, Sunday-week, and Day sections
- [ ] Month banner shows month name, year, and entry count
- [ ] Event cards show time range, title, location, and detail
- [ ] Task cards show optional time, title, detail, and unchecked status
- [ ] Events appear before tasks; items with times sort chronologically
- [ ] Jump to today button scrolls timeline to current date
- [ ] Screen integration tests verify timeline grouping, sorting, and jump behavior

## Blocked by

- #12
