import { ImageResponse } from "next/og";
import { LOGO_PATHS } from "@/components/brand/logo";
import { verifyShareParams } from "@/lib/share-signature";

export const dynamic = "force-dynamic";

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
 * After-run share card (Instagram-story portrait, 1080x1920) rendered via
 * next/og. Public under /api so it can be shared, but the params must carry a
 * valid app-issued signature (minted by signedRunImageUrl on the server).
 * Query params: distance, time, pace (already formatted, metric).
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const distance = searchParams.get("distance") ?? "";
  const time = searchParams.get("time") ?? "";
  const pace = searchParams.get("pace") ?? "";

  const ok = verifyShareParams({ distance, time, pace }, searchParams.get("sig"));
  if (!ok) return new Response("Invalid signature", { status: 403 });

  const rows: { label: string; value: string }[] = [
    { label: "Distance", value: distance.slice(0, 24) },
    { label: "Temps", value: time.slice(0, 24) },
    { label: "Allure", value: pace.slice(0, 24) },
  ];

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
          padding: "120px 96px",
          background: "linear-gradient(160deg, #0d0b0a 0%, #171412 55%, #211d1a 100%)",
          color: "#f7f2ea",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, color: "#F2A93B", letterSpacing: 2 }}>
          MA COURSE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 56, marginTop: 80 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: 36, color: "#b9b1a6" }}>{r.label}</div>
              <div style={{ display: "flex", fontSize: 120, fontWeight: 700, lineHeight: 1 }}>{r.value}</div>
            </div>
          ))}
        </div>
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
