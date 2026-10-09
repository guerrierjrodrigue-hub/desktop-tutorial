import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

/**
 * Shareable verse image (Instagram-story portrait, 1080×1920). Rendered from
 * `?ref=` and `?text=` query params via next/og. Lives under /api so it stays
 * publicly reachable (not behind the app's auth-guarded routes) for sharing.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").slice(0, 500);
  const reference = (searchParams.get("ref") ?? "").slice(0, 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "120px 96px",
          background: "linear-gradient(160deg, #0b0b0f 0%, #17110c 55%, #241405 100%)",
          color: "#f5f0e6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, color: "#f0a13f", letterSpacing: 4 }}>
          KINGDOM ATHLETE
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 64, lineHeight: 1.3 }}>
          “{text}”
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 44, color: "#f0a13f", fontWeight: 700 }}>
          {reference}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#9b948a" }}>
          Strengthen your body. Grow your faith.
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
