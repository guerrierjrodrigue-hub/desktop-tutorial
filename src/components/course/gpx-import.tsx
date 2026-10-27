"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { previewGpxRun, importGpxRun, type GpxPreviewResult } from "@/app/(app)/course/actions";
import { showXp } from "@/components/gamification/xp-toast";
import { formatDuration, formatKm, formatPace, runEarnsXp } from "@/lib/running";
import { MAX_GPX_BYTES } from "@/lib/gpx";
import type { Dictionary } from "@/i18n/dictionaries/en";

type Preview = Extract<GpxPreviewResult, { ok: true }>["preview"];

/**
 * Upload a .gpx file: the distance, time and date are read on the server and
 * shown as a preview. Nothing is saved until the user confirms. The run is
 * stored with source "import"; no track is kept. The 5 MB cap is checked before
 * upload and re-checked server-side.
 */
export function GpxImport({ dict, today }: { dict: Dictionary; today: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [noXpNote, setNoXpNote] = useState(false);
  const [pending, startTransition] = useTransition();

  const fail = (code?: string) =>
    (code && (dict[code as keyof Dictionary] as string)) || dict["course.gpx.unreadable"];

  function reset() {
    setContent(null);
    setPreview(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDone(false);
    setNoXpNote(false);
    setPreview(null);
    setContent(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_GPX_BYTES) {
      setError(dict["course.gpx.tooBig"]);
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setError(dict["course.gpx.unreadable"]);
      return;
    }
    startTransition(async () => {
      const res = await previewGpxRun({ content: text });
      if (res.ok) {
        setContent(text);
        setPreview(res.preview);
      } else {
        setError(fail(res.error));
      }
    });
  }

  function save() {
    if (!content || !preview) return;
    const earns = runEarnsXp(preview.distanceM, preview.durationS, preview.ranOn, today);
    startTransition(async () => {
      const res = await importGpxRun({ content });
      if (res.ok) {
        if (res.xp) showXp(res.xp);
        reset();
        setNoXpNote(!earns);
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
      </div>

      {preview && (
        <div className="mt-4" data-testid="gpx-preview">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">{dict["course.gpx.preview"]}</p>
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-2 p-4 text-sm">
            <div>
              <dt className="text-xs text-faint">{dict["course.tools.distanceKm"]}</dt>
              <dd className="font-semibold">{formatKm(preview.distanceM)} km</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">{dict["course.tools.time"]}</dt>
              <dd className="font-semibold tabular-nums">{formatDuration(preview.durationS)}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">{dict["course.pace"]}</dt>
              <dd className="font-semibold tabular-nums">{formatPace(preview.paceSPerKm)} {dict["course.tools.perKm"]}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">{dict["course.new.date"]}</dt>
              <dd className="font-semibold tabular-nums">{preview.ranOn}</dd>
            </div>
          </dl>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={save} disabled={pending}>
              <Check className="size-4" /> {dict["course.gpx.import"]}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={reset} disabled={pending}>
              {dict["common.cancel"]}
            </Button>
          </div>
        </div>
      )}

      {done && (
        <div className="mt-3">
          <p role="status" className="flex items-center gap-1.5 text-sm text-green-bright">
            <Check className="size-4" /> {dict["course.gpx.imported"]}
          </p>
          {noXpNote && <p className="mt-1 text-sm text-muted">{dict["course.noXpNote"]}</p>}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-ember">{error}</p>}
    </Card>
  );
}
