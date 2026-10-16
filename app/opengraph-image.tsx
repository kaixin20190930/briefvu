import { ImageResponse } from "next/og";

export const alt = "BriefVu — Small tools, instantly useful";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fffdf8", color: "#10202b", padding: "68px 76px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, fontWeight: 800 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: "#136fe8", color: "white", fontSize: 28 }}>B</div>
        BriefVu
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#0757be", fontSize: 23, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Invisible Text Generator</div>
        <div style={{ maxWidth: 980, marginTop: 20, fontSize: 66, lineHeight: 1.06, fontWeight: 800, letterSpacing: -3 }}>Generate, copy, and verify invisible Unicode text.</div>
      </div>
      <div style={{ fontSize: 24, color: "#5e6d78" }}>Browser-local · Five character options · Paste-back verification</div>
    </div>,
    size,
  );
}
