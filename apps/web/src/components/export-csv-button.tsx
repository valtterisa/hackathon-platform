"use client";

import { Button } from "@hackhost/ui";
import { useState } from "react";

export function ExportCsvButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      size="sm"
      variant="outline"
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch(`/api/events/${slug}/people.csv`);
        const text = await res.text();
        const blob = new Blob([text], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug}-people.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setBusy(false);
      }}
    >
      Export CSV
    </Button>
  );
}
