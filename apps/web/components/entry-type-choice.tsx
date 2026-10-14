import * as React from "react";

import { ENTRY_TYPES, TYPE_LABEL, type EntryType } from "@/lib/daystitch";

// One shared Task/Event choice control for the day chooser, FAB speeddial,
// and sheet type group. Each site keeps its own styling via `render`.
export function EntryTypeChoice({
  render,
}: {
  render: (type: EntryType, label: string) => React.ReactNode;
}) {
  return (
    <>
      {ENTRY_TYPES.map((t) => (
        <React.Fragment key={t}>{render(t, TYPE_LABEL[t])}</React.Fragment>
      ))}
    </>
  );
}
