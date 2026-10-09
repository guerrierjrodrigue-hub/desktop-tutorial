import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

/**
 * Shareable achievement image (Instagram-story portrait, 1080×1920) rendered
 * via next/og. Public (under /api) so it can be shared. Query params:
 *   type  = "streak" | "badge" | "verse"
 *   value = the headline (streak number, badge name, or verse reference)
 *   label = the caption under the headline
 *   text  = (verse) the verse text
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "streak";
  const value = (searchParams.get("value") ?? "").slice(0, 120);
  const label = (searchParams.get("label") ?? "").slice(0, 160);
  const text = (searchParams.get("text") ?? "").slice(0, 400);

  const headlineSize = type === "verse" ? 56 : 240;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "120px 96px",
          background: "linear-gradient(160deg, #0b0b0f 0%, #17110c 55%, #241405 100%)",
          color: "#f5f0e6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, color: "#f0a13f", letterSpacing: 4 }}>
          KINGDOM ATHLETE
        </div>

        {type === "verse" ? (
          <div style={{ display: "flex", marginTop: 72, fontSize: headlineSize, lineHeight: 1.3 }}>
            “{text}”
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              marginTop: 48,
              fontSize: headlineSize,
              fontWeight: 700,
              color: "#f0a13f",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
        )}

        <div style={{ display: "flex", marginTop: 40, fontSize: 48 }}>{type === "verse" ? value : label}</div>

        <div style={{ display: "flex", marginTop: 80, fontSize: 30, color: "#9b948a" }}>
          Strengthen your body. Grow your faith.
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
