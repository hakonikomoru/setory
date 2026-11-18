import { ImageResponse } from "next/og";
import { SITE_TITLE, SITE_TITLE_FULL } from "@/lib/site-metadata";

export const alt = SITE_TITLE_FULL;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** public/favicon.svg と同じロゴ */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="16" fill="#6D28D9"/><path d="M18 42V22l10 8 10-8 8 6v14H18z" fill="#F5D0FE"/><circle cx="24" cy="30" r="3" fill="#4C1D95"/><circle cx="40" cy="30" r="3" fill="#4C1D95"/><path d="M22 46h20" stroke="#FDF4FF" stroke-width="3" stroke-linecap="round"/></svg>`;

// 既定フォントは日本語の字形を持たないため、画像内の文字はラテン文字だけにする
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        background: "linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)",
      }}
    >
      <img
        src={`data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`}
        width={220}
        height={220}
        alt=""
      />
      <div style={{ fontSize: 160, fontWeight: 900, color: "#2e1065", letterSpacing: -4 }}>
        {SITE_TITLE}
      </div>
    </div>,
    size,
  );
}
