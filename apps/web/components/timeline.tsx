"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown } from "lucide-react";

import {
  daysOfWeek,
  fmtRange,
  isoDay,
  monthEndDay,
  monthIndex,
  monthStartDay,
  sortEntries,
  sundaysOfMonth,
  weekLabel,
  type DayEntry,
} from "@/lib/daystitch";

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

function EventCard({ entry }: { entry: DayEntry }) {
  const sub = fmtRange(entry);
  const meta = [sub, entry.loc, entry.detail].filter(Boolean).join(" · ");
  return (
    <div
      data-testid="event-card"
      data-entry-id={entry._id}
      className="bg-secondary/50 rounded-xl px-3.5 py-3"
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
}: {
  entry: DayEntry;
  onToggle: () => void;
}) {
  const sub = fmtRange(entry);
  const meta = [sub, entry.detail].filter(Boolean).join(" · ");
  const done = Boolean(entry.done);
  return (
    <div
      data-testid="task-card"
      data-entry-id={entry._id}
      data-done={done ? "true" : "false"}
      className="bg-secondary/50 flex items-start gap-2.5 rounded-xl px-3.5 py-3"
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
}: {
  day: Date;
  todayKey: string;
  entries: DayEntry[];
  onToggleDone: (id: string) => void;
}) {
  const key = isoDay(day);
  const dow = day.toLocaleDateString("en-US", { weekday: "short" });
  const sorted = sortEntries(entries);
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
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {sorted.length === 0 ? (
          <div data-testid="day-empty" className="text-muted-foreground/70 py-1 text-[13px]">
            No entries
          </div>
        ) : (
          sorted.map((e) =>
            e.type === "task" ? (
              <TaskCard key={e._id} entry={e} onToggle={() => onToggleDone(e._id)} />
            ) : (
              <EventCard key={e._id} entry={e} />
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

function TimelineConnected() {
  const todayKey = React.useMemo(() => isoDay(new Date()), []);
  const [{ start, end }, setWindow] = React.useState(() => {
    const cur = monthIndex(new Date());
    return { start: cur - 1, end: cur + 1 };
  });
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [extending, setExtending] = React.useState<null | "top" | "bottom">(null);
  const scrolledRef = React.useRef(false);
  const loadedRef = React.useRef(false);
  const anchorRef = React.useRef<{ id: string; top: number } | null>(null);

  const rangeStart = monthStartDay(start);
  const rangeEnd = monthEndDay(end);
  const entries = useQuery("entries:listRange" as never, {
    start: rangeStart,
    end: rangeEnd,
  } as never) as DayEntry[] | undefined;
  const toggleDone = useMutation("entries:toggleDone" as never) as unknown as (
    args: { id: string },
  ) => Promise<void>;

  loadedRef.current = entries !== undefined;

  React.useEffect(() => {
    if (entries !== undefined) setExtending(null);
  }, [entries]);

  React.useEffect(() => {
    if (entries !== undefined && !scrolledRef.current) {
      scrolledRef.current = true;
      document.getElementById(`d-${todayKey}`)?.scrollIntoView({ block: "start" });
    }
  }, [entries, todayKey]);

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
        if (window.scrollY < 500) {
          const el = document
            .elementFromPoint(window.innerWidth / 2, 80)
            ?.closest?.("[data-ym]");
          if (el?.id) {
            anchorRef.current = {
              id: el.id,
              top: (el as HTMLElement).getBoundingClientRect().top,
            };
          }
          setExtending("top");
          setWindow((w) => ({ ...w, start: w.start - 1 }));
        }
        if (
          window.innerHeight + window.scrollY >
          document.body.scrollHeight - 500
        ) {
          setExtending("bottom");
          setWindow((w) => ({ ...w, end: w.end + 1 }));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      void toggleDone({ id } as never);
    },
    [toggleDone],
  );

  if (entries === undefined) return <TimelineLoading />;

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
    </div>
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
