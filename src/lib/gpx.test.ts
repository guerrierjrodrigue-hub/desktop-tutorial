import { describe, it, expect } from "vitest";
import { parseGpx, haversineM } from "@/lib/gpx";

describe("haversine", () => {
  it("is zero for the same point", () => {
    expect(haversineM(48.85, 2.35, 48.85, 2.35)).toBe(0);
  });
  it("approximates one degree of latitude as ~111 km", () => {
    const d = haversineM(0, 0, 1, 0);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });
});

const GPX = `<?xml version="1.0"?>
<gpx version="1.1" creator="test">
  <trk><name>Morning run</name><trkseg>
    <trkpt lat="48.8566" lon="2.3522"><ele>35</ele><time>2026-10-24T06:00:00Z</time></trkpt>
    <trkpt lat="48.8576" lon="2.3522"><time>2026-10-24T06:00:40Z</time></trkpt>
    <trkpt lat="48.8586" lon="2.3522"><time>2026-10-24T06:01:20Z</time></trkpt>
  </trkseg></trk>
</gpx>`;

describe("parseGpx", () => {
  it("reads distance, duration and date", () => {
    const s = parseGpx(GPX);
    expect(s.points).toBe(3);
    // Two ~111 m hops north -> roughly 222 m total.
    expect(s.distanceM).toBeGreaterThan(200);
    expect(s.distanceM).toBeLessThan(250);
    expect(s.durationS).toBe(80);
    expect(s.date).toBe("2026-10-24");
  });

  it("handles lon before lat and self-closing points", () => {
    const xml = `<gpx><trkseg>
      <trkpt lon="2.3522" lat="48.8566"><time>2026-01-02T10:00:00Z</time></trkpt>
      <trkpt lat="48.8576" lon="2.3522"/>
    </trkseg></gpx>`;
    const s = parseGpx(xml);
    expect(s.points).toBe(2);
    expect(s.distanceM).toBeGreaterThan(100);
    expect(s.date).toBe("2026-01-02");
  });

  it("returns an empty summary when there are no track points", () => {
    expect(parseGpx("<gpx></gpx>")).toEqual({ distanceM: 0, durationS: 0, date: null, points: 0 });
  });

  it("ignores points with out-of-range coordinates", () => {
    const xml = `<gpx><trkseg>
      <trkpt lat="999" lon="2.35"></trkpt>
      <trkpt lat="48.85" lon="2.35"></trkpt>
    </trkseg></gpx>`;
    expect(parseGpx(xml).points).toBe(1);
  });
});
