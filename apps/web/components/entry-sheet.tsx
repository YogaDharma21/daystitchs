"use client";

import * as React from "react";
import { useMutation } from "convex/react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  entryDateSummary,
  validateEntryDraft,
  type DayEntry,
  type EntryType,
} from "@/lib/daystitch";

interface EntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  entry: DayEntry | null;
  preset: EntryType;
}

export default function EntrySheet({
  open,
  onOpenChange,
  date,
  entry,
  preset,
}: EntrySheetProps) {
  const create = useMutation("entries:create" as never) as unknown as (
    args: Record<string, unknown>,
  ) => Promise<string>;
  const update = useMutation("entries:update" as never) as unknown as (
    args: Record<string, unknown>,
  ) => Promise<void>;
  const remove = useMutation("entries:remove" as never) as unknown as (
    args: { id: string },
  ) => Promise<void>;

  const [type, setType] = React.useState<EntryType>(entry?.type ?? preset);
  const [title, setTitle] = React.useState(entry?.title ?? "");
  const [day, setDay] = React.useState(entry?.date ?? date);
  const [start, setStart] = React.useState(entry?.start ?? "10:00");
  const [end, setEnd] = React.useState(entry?.end ?? "10:30");
  const [time, setTime] = React.useState(entry?.time ?? "");
  const [loc, setLoc] = React.useState(entry?.loc ?? "");
  const [detail, setDetail] = React.useState(entry?.detail ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setType(entry?.type ?? preset);
    setTitle(entry?.title ?? "");
    setDay(entry?.date ?? date);
    setStart(entry?.start ?? "10:00");
    setEnd(entry?.end ?? "10:30");
    setTime(entry?.time ?? "");
    setLoc(entry?.loc ?? "");
    setDetail(entry?.detail ?? "");
    setSaving(false);
  }, [open, entry, date, preset]);

  const draft = { title, date: day, type, start, end, time, loc, detail };
  const error = validateEntryDraft(draft);
  const summary = entryDateSummary(draft);
  const isEdit = entry !== null;

  const onSave = () => {
    if (error || saving) return;
    setSaving(true);
    const payload: Record<string, unknown> = {
      date: day,
      title: title.trim(),
      type,
    };
    if (type === "event") {
      if (start) payload.start = start;
      if (end) payload.end = end;
      if (loc.trim()) payload.loc = loc.trim();
    } else if (time) {
      payload.time = time;
    }
    if (detail.trim()) payload.detail = detail.trim();
    const done = (isEdit ? update({ ...payload, id: entry._id }) : create(payload)) as Promise<unknown>;
    void done.then(
      () => onOpenChange(false),
      () => setSaving(false),
    );
  };

  const onDelete = () => {
    if (!entry || saving) return;
    setSaving(true);
    void (remove({ id: entry._id }) as Promise<unknown>).then(
      () => onOpenChange(false),
      () => setSaving(false),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        data-testid="entry-sheet"
        className="mx-auto w-full max-w-2xl rounded-t-2xl px-6 pt-3 pb-8"
      >
        <div
          aria-hidden="true"
          className="bg-border mx-auto mb-2 h-1 w-10 rounded-full"
        />
        <SheetHeader className="p-0 text-left">
          <SheetTitle data-testid="entry-sheet-title">
            {isEdit
              ? `Edit ${type === "event" ? "event" : "task"}`
              : `New ${type === "event" ? "event" : "task"}`}
          </SheetTitle>
          <SheetDescription data-testid="entry-date-summary">
            {summary}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3 flex gap-2" role="group" aria-label="Entry type">
          {(["task", "event"] as EntryType[]).map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={type === t ? "default" : "secondary"}
              aria-pressed={type === t}
              data-testid={`entry-type-${t}`}
              onClick={() => setType(t)}
            >
              {t === "task" ? "Task" : "Event"}
            </Button>
          ))}
        </div>

        <label
          htmlFor="entry-title"
          className="text-muted-foreground mt-3 block text-xs font-semibold"
        >
          Title
        </label>
        <Input
          id="entry-title"
          data-testid="entry-title"
          placeholder="e.g. Project update"
          maxLength={80}
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label
          htmlFor="entry-date"
          className="text-muted-foreground mt-3 block text-xs font-semibold"
        >
          Date
        </label>
        <Input
          id="entry-date"
          data-testid="entry-date"
          type="date"
          aria-label="Date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        {type === "event" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="entry-start"
                className="text-muted-foreground block text-xs font-semibold"
              >
                Start
              </label>
              <Input
                id="entry-start"
                data-testid="entry-start"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="entry-end"
                className="text-muted-foreground block text-xs font-semibold"
              >
                End
              </label>
              <Input
                id="entry-end"
                data-testid="entry-end"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <label
              htmlFor="entry-time"
              className="text-muted-foreground block text-xs font-semibold"
            >
              Time (optional)
            </label>
            <Input
              id="entry-time"
              data-testid="entry-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        )}

        {type === "event" ? (
          <div className="mt-3">
            <label
              htmlFor="entry-loc"
              className="text-muted-foreground block text-xs font-semibold"
            >
              Location
            </label>
            <Input
              id="entry-loc"
              data-testid="entry-loc"
              placeholder="e.g. Central"
              maxLength={60}
              autoComplete="off"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            />
          </div>
        ) : null}

        <div className="mt-3">
          <label
            htmlFor="entry-detail"
            className="text-muted-foreground block text-xs font-semibold"
          >
            Detail
          </label>
          <Input
            id="entry-detail"
            data-testid="entry-detail"
            placeholder={
              type === "task" ? "e.g. Bring slides" : "e.g. Agenda, links, notes"
            }
            maxLength={120}
            autoComplete="off"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </div>

        <div className="mt-4 flex gap-2">
          {isEdit ? (
            <Button
              type="button"
              variant="destructive"
              data-testid="entry-delete"
              onClick={onDelete}
              disabled={saving}
              className="flex-1"
            >
              Delete
            </Button>
          ) : null}
          <Button
            type="button"
            data-testid="entry-save"
            onClick={onSave}
            disabled={error !== null || saving}
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
