import { ImageResponse } from "next/og";
import { LOGO_PATHS } from "@/components/brand/logo";
import { verifyShareParams } from "@/lib/share-signature";

export const dynamic = "force-dynamic";

// Stacked wordmark signature. next/og (satori) does not resolve currentColor, so
// the paths get explicit colors: cream text + gold cross.
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
  const rawValue = searchParams.get("value") ?? "";
  const rawLabel = searchParams.get("label") ?? "";
  const rawText = searchParams.get("text") ?? "";

  // Reject forged URLs: the params must carry a valid app-issued signature
  // (skipped only when no signing secret is configured, e.g. local/demo).
  const ok = verifyShareParams(
    { type, value: rawValue, label: rawLabel, text: rawText },
    searchParams.get("sig"),
  );
  if (!ok) return new Response("Invalid signature", { status: 403 });

  const value = rawValue.slice(0, 120);
  const label = rawLabel.slice(0, 160);
  const text = rawText.slice(0, 400);

  const headlineSize = type === "verse" ? 56 : 240;

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
          alignItems: "center",
          textAlign: "center",
          padding: "120px 96px",
          background: "linear-gradient(160deg, #0d0b0a 0%, #171412 55%, #211d1a 100%)",
          color: "#f7f2ea",
          fontFamily: "Georgia, serif",
        }}
      >
        {type === "verse" ? (
          <div style={{ display: "flex", fontSize: headlineSize, lineHeight: 1.3 }}>
            “{text}”
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              fontSize: headlineSize,
              fontWeight: 700,
              color: "#ff5a36",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
        )}

        <div style={{ display: "flex", marginTop: 40, fontSize: 48 }}>
          {type === "verse" ? value : label}
        </div>

        {/* Brand signature, pinned to the bottom. */}
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SIGNATURE} width={380} height={(380 * 168) / 709} alt="Kingdom Athlete" />
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
