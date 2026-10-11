import { ImageResponse } from "next/og";
import { LOGO_PATHS } from "@/components/brand/logo";
import { verifyShareParams } from "@/lib/share-signature";

export const dynamic = "force-dynamic";

// Stacked wordmark signature with explicit colors (next/og ignores currentColor).
const S = LOGO_PATHS.stacked;
const SIGNATURE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${S.vb}">` +
      `<path d="${S.king}" fill="#F7F2EA"/>` +
      `<path d="${S.ath}" fill="#F7F2EA"/>` +
      `<path d="${S.cross}" fill="#F2A93B"/></svg>`,
  );

/**
 * Shareable verse image (Instagram-story portrait, 1080×1920). Rendered from
 * `?ref=` and `?text=` query params via next/og. Lives under /api so it stays
 * publicly reachable (not behind the app's auth-guarded routes) for sharing.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get("text") ?? "";
  const rawRef = searchParams.get("ref") ?? "";

  const ok = verifyShareParams({ ref: rawRef, text: rawText }, searchParams.get("sig"));
  if (!ok) return new Response("Invalid signature", { status: 403 });

  const text = rawText.slice(0, 500);
  const reference = rawRef.slice(0, 100);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "120px 96px",
          background: "linear-gradient(160deg, #0d0b0a 0%, #171412 55%, #211d1a 100%)",
          color: "#f7f2ea",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.3 }}>“{text}”</div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 44, color: "#f2a93b", fontWeight: 700 }}>
          {reference}
        </div>

        {/* Brand signature, pinned to the bottom. */}
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 96,
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SIGNATURE} width={340} height={(340 * 168) / 709} alt="Kingdom Athlete" />
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
