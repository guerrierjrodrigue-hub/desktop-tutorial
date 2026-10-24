"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { importGpxRun } from "@/app/(app)/course/actions";
import { showXp } from "@/components/gamification/xp-toast";
import { MAX_GPX_BYTES } from "@/lib/gpx";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Upload a .gpx file: the distance, time and date are read on the server and a
 * run is logged. No track is stored. The 5 MB cap is checked before upload and
 * re-checked server-side. Limits mirror a manual entry.
 */
export function GpxImport({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const fail = (code?: string) =>
    (code && (dict[code as keyof Dictionary] as string)) || dict["course.gpx.unreadable"];

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDone(false);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.size > MAX_GPX_BYTES) {
      setError(dict["course.gpx.tooBig"]);
      return;
    }
    let content: string;
    try {
      content = await file.text();
    } catch {
      setError(dict["course.gpx.unreadable"]);
      return;
    }
    startTransition(async () => {
      const res = await importGpxRun({ content });
      if (res.ok) {
        if (res.xp) showXp(res.xp);
        // The server recomputed distance/duration; show success and let the
        // page revalidate the run list and stats.
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
        setDone(true);
        router.refresh();
      } else {
        setError(fail(res.error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["course.gpx.title"]}</CardTitle>
        <FileUp className="size-4 text-accent/80" />
      </CardHeader>
      <p className="text-sm text-muted">{dict["course.gpx.subtitle"]}</p>

      <div className="mt-4">
        <input
          ref={fileRef}
          id="gpx-file"
          type="file"
          accept=".gpx,application/gpx+xml,application/xml,text/xml"
          onChange={onFile}
          disabled={pending}
          className="sr-only"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
        >
          <Upload className="size-4" /> {pending ? dict["course.gpx.reading"] : dict["course.gpx.choose"]}
        </Button>
        {fileName && !done && !error && (
          <p className="mt-2 truncate text-xs text-faint">{fileName}</p>
        )}
      </div>

      {done && (
        <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-green-bright">
          <Check className="size-4" /> {dict["course.gpx.imported"]}
        </p>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-ember">{error}</p>}
    </Card>
  );
}
