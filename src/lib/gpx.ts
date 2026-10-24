/**
 * Minimal, dependency-free GPX reader. Parses only what we store: total
 * distance (from track points, great-circle summed), duration (last time minus
 * first time) and the run date. No track, route or elevation is kept. Pure and
 * unit-tested in gpx.test.ts; the server action enforces the 5 MB size cap and
 * the same plausibility limits as a manual entry.
 */

/** Largest GPX file we accept, in bytes. */
export const MAX_GPX_BYTES = 5 * 1024 * 1024; // 5 MB

export interface GpxSummary {
  distanceM: number;
  durationS: number;
  /** Run date as YYYY-MM-DD (UTC) from the first timestamp, or null if absent. */
  date: string | null;
  /** Number of track points read (0 means nothing usable). */
  points: number;
}

/** Great-circle distance between two lat/lon points, in metres. */
export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000; // mean Earth radius, metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

interface TrackPoint {
  lat: number;
  lon: number;
  time: number | null; // epoch ms
}

/** Pull <trkpt lat="" lon="">...<time>...</time></trkpt> points in document order. */
function readTrackPoints(xml: string): TrackPoint[] {
  const points: TrackPoint[] = [];
  // Match each trkpt element (lat/lon in either order), capturing its inner XML.
  const trkptRe = /<trkpt\b([^>]*?)>([\s\S]*?)<\/trkpt>|<trkpt\b([^>]*?)\/>/gi;
  let m: RegExpExecArray | null;
  while ((m = trkptRe.exec(xml)) !== null) {
    const attrs = m[1] ?? m[3] ?? "";
    const inner = m[2] ?? "";
    const lat = Number(/\blat\s*=\s*"([^"]+)"/i.exec(attrs)?.[1]);
    const lon = Number(/\blon\s*=\s*"([^"]+)"/i.exec(attrs)?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
    const timeStr = /<time>([^<]+)<\/time>/i.exec(inner)?.[1];
    const t = timeStr ? Date.parse(timeStr) : NaN;
    points.push({ lat, lon, time: Number.isFinite(t) ? t : null });
  }
  return points;
}

/**
 * Parse a GPX document into a stored summary. Distance sums the great-circle
 * hops between consecutive points; duration is the span of the first and last
 * timestamps (0 when times are missing). Returns 0-point summary when the file
 * has no usable track points.
 */
export function parseGpx(xml: string): GpxSummary {
  const points = readTrackPoints(xml);
  if (points.length === 0) return { distanceM: 0, durationS: 0, date: null, points: 0 };

  let distanceM = 0;
  for (let i = 1; i < points.length; i++) {
    distanceM += haversineM(
      points[i - 1].lat, points[i - 1].lon,
      points[i].lat, points[i].lon,
    );
  }

  const times = points.map((p) => p.time).filter((t): t is number => t !== null);
  let durationS = 0;
  let date: string | null = null;
  if (times.length >= 1) {
    const first = Math.min(...times);
    const last = Math.max(...times);
    durationS = Math.max(0, Math.round((last - first) / 1000));
    date = new Date(first).toISOString().slice(0, 10);
  }

  return { distanceM: Math.round(distanceM), durationS, date, points: points.length };
}
