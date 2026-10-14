"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  daysOfWeek,
  entryCardMeta,
  fmtRange,
  isoDay,
  jumpTarget,
  jumpWindow,
  miniGridCells,
  monthEndDay,
  monthIndex,
  monthStartDay,
  sortEntries,
  sundaysOfMonth,
  titleForYm,
  weekLabel,
  type DayEntry,
  type EntryType,
} from "@/lib/daystitch";
import { listRangeQuery, toggleDoneMutation } from "@/lib/entries-api";
import EntrySheet from "@/components/entry-sheet";
import { EntryTypeChoice } from "@/components/entry-type-choice";

function MonthBanner({
  year,
  month,
  count,
}: {
  year: number;
  month: number;
  count: number;
}) {
  const name = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
  });
  return (
    <div
      data-testid="month-banner"
      id={`m-${year}-${month}`}
      data-ym={`${year}-${month}`}
      className="border-b px-6 py-10"
    >
      <p data-testid="month-count" className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        {year} · {count} {count === 1 ? "entry" : "entries"}
      </p>
      <h2 data-testid="month-title" className="mt-1 text-3xl font-bold tracking-tight">
        {name}
      </h2>
    </div>
  );
}

function WeekRow({
  sunKey,
  ym,
  sun,
  open,
  count,
  onToggle,
}: {
  sunKey: string;
  ym: string;
  sun: Date;
  open: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <button
      data-testid="week-row"
      id={`w-${sunKey}`}
      data-ym={ym}
      type="button"
      aria-expanded={open}
      {...(open ? { "data-collapse": sunKey } : { "data-expand": sunKey })}
      onClick={onToggle}
      className="text-muted-foreground flex w-full items-center gap-3 px-6 pt-8 pb-1 text-left text-[11px] font-bold tracking-[0.14em] uppercase"
    >
      <span data-testid="week-label" className="flex-none">
        {weekLabel(sun)}
      </span>
      {count > 0 ? (
        <span
          data-testid="week-count"
          className="bg-secondary flex-none rounded-full border px-2.5 py-0.5 normal-case tracking-normal"
        >
          {count} {count === 1 ? "entry" : "entries"}
        </span>
      ) : null}
      <span aria-hidden="true" className="bg-border h-px flex-1" />
      <ChevronDown
        aria-hidden="true"
        className={`size-3.5 flex-none transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function onCardKeyDown(onOpen: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") onOpen();
  };
}

function EventCard({ entry, onOpen }: { entry: DayEntry; onOpen: () => void }) {
  const sub = fmtRange(entry);
  const meta = entryCardMeta([sub, entry.loc, entry.detail]);
  return (
    <div
      data-testid="event-card"
      data-entry-id={entry._id}
      data-open={entry._id}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onCardKeyDown(onOpen)}
      className="bg-secondary/50 cursor-pointer rounded-xl px-3.5 py-3"
    >
      <div data-testid="event-title" className="text-sm font-semibold">
        {entry.title}
      </div>
      {meta ? (
        <div data-testid="event-sub" className="text-muted-foreground mt-0.5 text-xs">
          {meta}
        </div>
      ) : null}
    </div>
  );
}

function TaskCard({
  entry,
  onToggle,
  onOpen,
}: {
  entry: DayEntry;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const sub = fmtRange(entry);
  const meta = entryCardMeta([sub, entry.detail]);
  const done = Boolean(entry.done);
  return (
    <div
      data-testid="task-card"
      data-entry-id={entry._id}
      data-open={entry._id}
      data-done={done ? "true" : "false"}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onCardKeyDown(onOpen)}
      className="bg-secondary/50 flex cursor-pointer items-start gap-2.5 rounded-xl px-3.5 py-3"
    >
      <button
        data-testid="task-toggle"
        data-check={entry._id}
        type="button"
        aria-label={`Toggle done for ${entry.title}`}
        aria-pressed={done}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`mt-0.5 flex size-5 flex-none items-center justify-center rounded-full border text-xs ${
          done ? "bg-primary text-primary-foreground border-transparent" : "text-transparent"
        }`}
      >
        {done ? "✓" : ""}
      </button>
      <div className="min-w-0">
        <div
          data-testid="task-title"
          className={`text-sm font-semibold ${done ? "opacity-60 line-through" : ""}`}
        >
          {entry.title}
        </div>
        {meta ? (
          <div data-testid="task-sub" className="text-muted-foreground mt-0.5 text-xs">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DaySection({
  day,
  todayKey,
  entries,
  onToggleDone,
  onAdd,
  onOpen,
}: {
  day: Date;
  todayKey: string;
  entries: DayEntry[];
  onToggleDone: (id: string) => void;
  onAdd: (date: string, type: EntryType) => void;
  onOpen: (entry: DayEntry) => void;
}) {
  const key = isoDay(day);
  const dow = day.toLocaleDateString("en-US", { weekday: "short" });
  const sorted = sortEntries(entries);
  const [chooserOpen, setChooserOpen] = React.useState(false);
  return (
    <section
      data-testid="day-section"
      data-date={key}
      data-ym={`${day.getFullYear()}-${day.getMonth()}`}
      id={`d-${key}`}
      className="grid grid-cols-[44px_1fr] gap-2 px-6 pt-5"
    >
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <span className="text-muted-foreground text-[10px] font-bold tracking-[0.14em] uppercase">
          {dow}
        </span>
        <span
          data-testid="day-number"
          data-today={key === todayKey ? "true" : "false"}
          className={`flex size-9 items-center justify-center rounded-full text-lg font-bold tabular-nums ${
            key === todayKey ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          {day.getDate()}
        </span>
        <button
          type="button"
          data-testid="day-add"
          data-add={key}
          aria-label={`Add on ${key}`}
          aria-expanded={chooserOpen}
          onClick={() => setChooserOpen((v) => !v)}
          className="border-border text-muted-foreground mt-1.5 flex size-6 items-center justify-center rounded-full border text-sm leading-none"
        >
          {chooserOpen ? "×" : "+"}
        </button>
        {chooserOpen ? (
          <div data-testid="day-choose" data-choose={key} className="flex flex-col gap-1.5">
            <EntryTypeChoice
              render={(t, label) => (
                <button
                  type="button"
                  data-testid={`day-pick-${t}`}
                  data-pick={t}
                  data-date={key}
                  onClick={() => {
                    setChooserOpen(false);
                    onAdd(key, t);
                  }}
                  className="bg-secondary rounded-full border px-2.5 py-1 text-[11px] font-bold"
                >
                  {label}
                </button>
              )}
            />
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {sorted.length === 0 ? (
          <div data-testid="day-empty" className="text-muted-foreground/70 py-1 text-[13px]">
            No entries
          </div>
        ) : (
          sorted.map((e) =>
            e.type === "task" ? (
              <TaskCard
                key={e._id}
                entry={e}
                onToggle={() => onToggleDone(e._id)}
                onOpen={() => onOpen(e)}
              />
            ) : (
              <EventCard key={e._id} entry={e} onOpen={() => onOpen(e)} />
            ),
          )
        )}
      </div>
    </section>
  );
}

function TimelineLoading() {
  return (
    <div
      data-testid="timeline-loading"
      aria-busy="true"
      aria-label="Loading timeline"
      className="flex flex-col gap-3 px-6 py-10"
    >
      <div className="bg-muted h-24 animate-pulse rounded-xl" />
      <div className="bg-muted h-16 animate-pulse rounded-xl" />
      <div className="bg-muted h-16 animate-pulse rounded-xl" />
      <p className="text-muted-foreground text-center text-sm">Loading timeline…</p>
    </div>
  );
}

function MonthChip({
  idx,
  active,
  onJump,
}: {
  idx: number;
  active: boolean;
  onJump: (idx: number) => void;
}) {
  return (
    <button
      type="button"
      data-testid="picker-chip"
      data-idx={idx}
      aria-pressed={active}
      onClick={() => onJump(idx)}
      className={`flex-none rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        active
          ? "chip-on bg-primary text-primary-foreground border-transparent"
          : "bg-secondary"
      }`}
    >
      {new Date(Math.floor(idx / 12), idx % 12, 1).toLocaleDateString("en-US", {
        month: "short",
      })}
    </button>
  );
}

function TimelineConnected() {
  const todayKey = React.useMemo(() => isoDay(new Date()), []);
  const todayIdx = React.useMemo(() => monthIndex(new Date()), []);
  // Prototype bounds: one full year each side of the boot year.
  const { minMonth, maxMonth } = React.useMemo(() => {
    const y = new Date().getFullYear();
    return { minMonth: (y - 1) * 12, maxMonth: (y + 1) * 12 + 11 };
  }, []);
  const [{ start, end }, setWindow] = React.useState(() => {
    const cur = monthIndex(new Date());
    return { start: cur - 1, end: cur + 1 };
  });
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [extending, setExtending] = React.useState<null | "top" | "bottom">(null);
  const [fabOpen, setFabOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerIdx, setPickerIdx] = React.useState(todayIdx);
  const [title, setTitle] = React.useState(() => {
    const now = new Date();
    return titleForYm(`${now.getFullYear()}-${now.getMonth()}`);
  });
  const [sheet, setSheet] = React.useState<{
    open: boolean;
    date: string;
    entry: DayEntry | null;
    preset: EntryType;
  }>({ open: false, date: "", entry: null, preset: "task" });
  const scrolledRef = React.useRef(false);
  const loadedRef = React.useRef(false);
  const anchorRef = React.useRef<{ id: string; top: number } | null>(null);
  const pendingJump = React.useRef<string | null>(null);
  const chipsRef = React.useRef<HTMLDivElement | null>(null);
  // In-flight guard: one scroll gesture adds one month per end. `extending`
  // state drives the loading UI; this ref flips synchronously so rapid scroll
  // ticks cannot queue extra extensions before the new range query resolves.
  const extendRef = React.useRef<null | "top" | "bottom">(null);
  // Synchronous mirror of the window for bounds checks inside the scroll
  // handler (state would read stale between dispatch and render).
  const winRef = React.useRef({ start, end });

  const rangeStart = monthStartDay(start);
  const rangeEnd = monthEndDay(end);
  const entries = useQuery(listRangeQuery, {
    start: rangeStart,
    end: rangeEnd,
  });
  const toggleDone = useMutation(toggleDoneMutation);

  loadedRef.current = entries !== undefined;

  // Keep the synchronous window mirror consistent for jumps/expansions that
  // do not go through the scroll handler.
  React.useEffect(() => {
    winRef.current = { start, end };
  }, [start, end]);

  React.useEffect(() => {
    if (entries !== undefined) {
      extendRef.current = null;
      setExtending(null);
    }
  }, [entries]);

  const scrollToKey = React.useCallback((key: string) => {
    const p = key.split("-");
    const el =
      document.getElementById(`d-${key}`) ??
      document.getElementById(`m-${Number(p[0])}-${Number(p[1]) - 1}`);
    el?.scrollIntoView({ block: "start" });
    const holder = el?.closest?.("[data-ym]") ?? el;
    const ym = holder?.getAttribute?.("data-ym");
    if (ym) setTitle(titleForYm(ym));
  }, []);

  React.useEffect(() => {
    if (entries === undefined) return;
    const key = pendingJump.current;
    pendingJump.current = null;
    if (key) {
      scrollToKey(key);
      return;
    }
    if (!scrolledRef.current) {
      scrolledRef.current = true;
      scrollToKey(todayKey);
    }
  }, [entries, start, end, expanded, todayKey, scrollToKey]);

  const jumpToDate = React.useCallback(
    (key: string) => {
      const { idx, sunKey } = jumpTarget(key);
      if (idx < minMonth || idx > maxMonth) return;
      setWindow((w) => jumpWindow(w, idx));
      setExpanded((prev) =>
        prev[sunKey] ? prev : { ...prev, [sunKey]: true },
      );
      setPickerOpen(false);
      pendingJump.current = key;
    },
    [minMonth, maxMonth],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPickerOpen(false);
      setFabOpen(false);
      setSheet((s) => (s.open ? { ...s, open: false } : s));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const chips = chipsRef.current;
    const on = chips?.querySelector(".chip-on");
    if (chips && on) {
      chips.scrollLeft =
        (on as HTMLElement).offsetLeft -
        chips.offsetLeft -
        chips.clientWidth / 2 +
        (on as HTMLElement).clientWidth / 2;
    }
  }, [pickerOpen, pickerIdx]);

  React.useEffect(() => {
    const a = anchorRef.current;
    if (!a) return;
    anchorRef.current = null;
    const restored = document.getElementById(a.id);
    if (restored) window.scrollBy(0, restored.getBoundingClientRect().top - a.top);
  }, [start]);

  React.useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!loadedRef.current) return;
        const top = document
          .elementFromPoint(window.innerWidth / 2, 80)
          ?.closest?.("[data-ym]");
        const ym = top?.getAttribute?.("data-ym");
        if (ym) setTitle(titleForYm(ym));
        // Sliding 3-month window: each extension adds one month and trims
        // the far end, so the range query stays ~3 months. One extension
        // per end while a query is in flight (extendRef guard).
        if (
          window.scrollY < 500 &&
          extendRef.current === null &&
          winRef.current.start > minMonth
        ) {
          const el = document
            .elementFromPoint(window.innerWidth / 2, 80)
            ?.closest?.("[data-ym]");
          if (el?.id) {
            anchorRef.current = {
              id: el.id,
              top: (el as HTMLElement).getBoundingClientRect().top,
            };
          }
          extendRef.current = "top";
          setExtending("top");
          setWindow((w) => {
            const next = { start: w.start - 1, end: w.end - 1 };
            winRef.current = next;
            return next;
          });
        }
        if (
          window.innerHeight + window.scrollY >
            document.body.scrollHeight - 500 &&
          extendRef.current === null &&
          winRef.current.end < maxMonth
        ) {
          extendRef.current = "bottom";
          setExtending("bottom");
          setWindow((w) => {
            const next = { start: w.start + 1, end: w.end + 1 };
            winRef.current = next;
            return next;
          });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [minMonth, maxMonth]);

  const byDate = React.useMemo(() => {
    const m = new Map<string, DayEntry[]>();
    for (const e of entries ?? []) {
      const list = m.get(e.date);
      if (list) list.push(e);
      else m.set(e.date, [e]);
    }
    return m;
  }, [entries]);

  const onToggleDone = React.useCallback(
    (id: string) => {
      void toggleDone({ id });
    },
    [toggleDone],
  );

  const openNew = React.useCallback(
    (date: string, preset: EntryType) =>
      setSheet({ open: true, date, entry: null, preset }),
    [],
  );
  const openEdit = React.useCallback((entry: DayEntry) =>
    setSheet({ open: true, date: entry.date, entry, preset: entry.type }),
  []);

  const pickerYear = Math.floor(pickerIdx / 12);
  const pickerMonth = pickerIdx % 12;
  const pickerCells = miniGridCells(pickerYear, pickerMonth, todayKey);
  const chipRange: number[] = [];
  for (let i = pickerIdx - 12; i <= pickerIdx + 12; i++) chipRange.push(i);
  const wdNames = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    new Date(2026, 9, 5 + i).toLocaleDateString("en-US", {
      weekday: "narrow",
    }),
  );

  const onChipJump = (idx: number) => {
    setPickerIdx(idx);
    const y = Math.floor(idx / 12);
    const m = idx % 12;
    jumpToDate(`${y}-${String(m + 1).padStart(2, "0")}-01`);
  };

  const header = (
    <div
      data-testid="timeline-header"
      className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-3">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="timeline-title"
              aria-label="Pick a date"
              aria-expanded={pickerOpen}
              className="flex items-center gap-1.5 text-lg font-semibold tracking-tight"
            >
              <span data-testid="timeline-title-text">{title}</span>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            data-testid="date-picker"
            align="start"
            className="w-72 p-3"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                data-testid="picker-prev"
                aria-label="Previous month"
                onClick={() => setPickerIdx((i) => Math.max(minMonth, i - 1))}
                className="bg-secondary flex size-8 items-center justify-center rounded-full"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <p data-testid="picker-label" className="text-sm font-semibold">
                {titleForYm(`${pickerYear}-${pickerMonth}`)}
              </p>
              <button
                type="button"
                data-testid="picker-next"
                aria-label="Next month"
                onClick={() => setPickerIdx((i) => Math.min(maxMonth, i + 1))}
                className="bg-secondary flex size-8 items-center justify-center rounded-full"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div
              ref={chipsRef}
              data-testid="picker-chips"
              className="mt-2 flex items-center gap-1 overflow-x-auto pb-1"
            >
              {chipRange.map((idx) =>
                idx % 12 === 0 ? (
                  <React.Fragment key={idx}>
                    <span className="text-muted-foreground flex-none px-1 text-[11px] font-bold">
                      {Math.floor(idx / 12)}
                    </span>
                    <MonthChip
                      idx={idx}
                      active={idx === pickerIdx}
                      onJump={onChipJump}
                    />
                  </React.Fragment>
                ) : (
                  <MonthChip
                    key={idx}
                    idx={idx}
                    active={idx === pickerIdx}
                    onJump={onChipJump}
                  />
                ),
              )}
            </div>
            <div
              data-testid="picker-grid"
              className="mt-1 grid grid-cols-7 gap-1 text-center"
            >
              {wdNames.map((w, i) => (
                <span
                  key={i}
                  className="text-muted-foreground py-1 text-[10px] font-bold"
                >
                  {w}
                </span>
              ))}
              {pickerCells.map((c, i) =>
                c.key ? (
                  <button
                    key={c.key}
                    type="button"
                    data-testid="picker-day"
                    data-jump={c.key}
                    aria-label={c.key}
                    onClick={() => jumpToDate(c.key as string)}
                    className={`flex size-8 items-center justify-center rounded-full text-[13px] tabular-nums ${
                      c.isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-secondary"
                    }`}
                  >
                    {c.day}
                  </button>
                ) : (
                  <span key={`b-${i}`} />
                ),
              )}
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          data-testid="today-btn"
          onClick={() => jumpToDate(todayKey)}
          className="bg-secondary rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
        >
          Today
        </button>
      </div>
    </div>
  );

  if (entries === undefined)
    return (
      <>
        {header}
        <TimelineLoading />
      </>
    );

  const months: { idx: number; year: number; month: number }[] = [];
  for (let i = start; i <= end; i++) {
    months.push({ idx: i, year: Math.floor(i / 12), month: i % 12 });
  }

  const toggleWeek = (sunKey: string) =>
    setExpanded((prev) => {
      if (prev[sunKey]) {
        const next = { ...prev };
        delete next[sunKey];
        return next;
      }
      return { ...prev, [sunKey]: true };
    });

  return (
    <>
      {header}
      <div data-testid="timeline" className="flex flex-col pb-16">
      {entries.length === 0 ? (
        <div data-testid="timeline-empty" className="px-6 pt-8 pb-2 text-center">
          <h2 className="text-base font-medium">No entries yet</h2>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            Your timeline is empty. New entries will appear here once you add
            them.
          </p>
        </div>
      ) : null}
      {extending === "top" ? (
        <div
          data-testid="timeline-extending"
          aria-busy="true"
          aria-label="Loading earlier months"
          className="text-muted-foreground px-6 py-3 text-center text-sm"
        >
          Loading earlier months…
        </div>
      ) : null}
      {months.map(({ idx, year, month }) => {
        const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
        const count = entries.filter((e) => e.date.startsWith(prefix)).length;
        return (
          <React.Fragment key={idx}>
            <MonthBanner year={year} month={month} count={count} />
            {sundaysOfMonth(year, month).map((sun) => {
              const sunKey = isoDay(sun);
              const days = daysOfWeek(sun);
              const ym = `${sun.getFullYear()}-${sun.getMonth()}`;
              const count = days.reduce(
                (n, d) => n + (byDate.get(isoDay(d))?.length ?? 0),
                0,
              );
              const isOpen = Boolean(expanded[sunKey]);
              if (isOpen) {
                return (
                  <React.Fragment key={sunKey}>
                    <WeekRow
                      sunKey={sunKey}
                      ym={ym}
                      sun={sun}
                      open
                      count={count}
                      onToggle={() => toggleWeek(sunKey)}
                    />
                    {days.map((d) => (
                      <DaySection
                        key={isoDay(d)}
                        day={d}
                        todayKey={todayKey}
                        entries={byDate.get(isoDay(d)) ?? []}
                        onToggleDone={onToggleDone}
                        onAdd={openNew}
                        onOpen={openEdit}
                      />
                    ))}
                  </React.Fragment>
                );
              }
              const hits = days.filter((d) => {
                const k = isoDay(d);
                return k === todayKey || byDate.has(k);
              });
              if (hits.length === 0) {
                return (
                  <WeekRow
                    key={sunKey}
                    sunKey={sunKey}
                    ym={ym}
                    sun={sun}
                    open={false}
                    count={0}
                    onToggle={() => toggleWeek(sunKey)}
                  />
                );
              }
              return (
                <React.Fragment key={sunKey}>
                  <WeekRow
                    sunKey={sunKey}
                    ym={ym}
                    sun={sun}
                    open={false}
                    count={count}
                    onToggle={() => toggleWeek(sunKey)}
                  />
                  {hits.map((d) => (
                    <DaySection
                      key={isoDay(d)}
                      day={d}
                      todayKey={todayKey}
                      entries={byDate.get(isoDay(d)) ?? []}
                      onToggleDone={onToggleDone}
                      onAdd={openNew}
                      onOpen={openEdit}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
      {extending === "bottom" ? (
        <div
          data-testid="timeline-extending"
          aria-busy="true"
          aria-label="Loading later months"
          className="text-muted-foreground px-6 py-6 text-center text-sm"
        >
          Loading later months…
        </div>
      ) : null}
      {fabOpen ? (
        <div
          data-testid="fab-scrim"
          aria-hidden="true"
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-30 bg-black/60"
        />
      ) : null}
      <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-2.5">
        {fabOpen ? (
          <div data-testid="fab-speeddial" className="flex flex-col items-end gap-2.5">
            <EntryTypeChoice
              render={(t, label) => (
                <button
                  type="button"
                  data-testid={`fab-create-${t}`}
                  onClick={() => {
                    setFabOpen(false);
                    openNew(todayKey, t);
                  }}
                  className="bg-secondary rounded-full px-5 py-3.5 text-[15px] font-semibold shadow-lg"
                >
                  {label}
                </button>
              )}
            />
          </div>
        ) : null}
        <button
          type="button"
          data-testid="fab"
          aria-label={fabOpen ? "Close" : "Add entry"}
          aria-expanded={fabOpen}
          onClick={() => setFabOpen((v) => !v)}
          className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full text-3xl leading-none shadow-lg"
        >
          <span aria-hidden="true" className={fabOpen ? "rotate-45" : ""}>
            +
          </span>
        </button>
      </div>
      <EntrySheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        date={sheet.date || todayKey}
        entry={sheet.entry}
        preset={sheet.preset}
      />
      </div>
    </>
  );
}

export default function Timeline() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return (
      <div
        data-testid="timeline-missing"
        className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
      >
        <h2 className="text-base font-medium">Timeline unavailable</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Add NEXT_PUBLIC_CONVEX_URL to load your entries.
        </p>
      </div>
    );
  }
  return <TimelineConnected />;
}
