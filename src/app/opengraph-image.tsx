import { ImageResponse } from "next/og";

// Social share card. French by design (the app defaults to French).
export const alt = "Kingdom Athlete — Fortifie ton corps. Grandis dans la foi.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#0d0b0a";
const ACCENT = "#f2a93b";
const TEXT = "#f7f2ea";

// Golden crown (same glyph as the app icon), as an inline SVG data URI.
const CROWN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${ACCENT}">` +
      `<path d="M3 8l3.8 2.8L12 5l5.2 5.8L21 8l-1.4 7.5H4.4L3 8Z"/>` +
      `<rect x="4.2" y="16.4" width="15.6" height="2.4" rx="0.7"/></svg>`,
  );

/**
 * Load the site's display serif (Fraunces) from Google Fonts for the OG text.
 * Network-dependent, so it falls back to the default serif if anything fails.
 */
async function loadFraunces(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const title = "Kingdom Athlete";
  const tagline = "Fortifie ton corps. Grandis dans la foi.";
  const fontData = await loadFraunces(`${title} ${tagline}`);
  const fontFamily = fontData ? "Fraunces" : "Georgia, serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          background: BACKGROUND,
          fontFamily,
        }}
      >
        <img src={CROWN} width={168} height={168} alt="" />
        <div style={{ display: "flex", fontSize: 92, fontWeight: 600, color: TEXT }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 44, color: ACCENT }}>{tagline}</div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Fraunces", data: fontData, style: "normal", weight: 600 }]
        : undefined,
    },
  );
}
