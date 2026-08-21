import { ImageResponse } from "next/og";

export const alt = "Briefvu — Custom apparel intake, ready for quoting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fbfcf9", color: "#16211c", padding: "68px 76px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, fontWeight: 800 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: "#187951", color: "white", fontSize: 28 }}>B</div>
        briefvu
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#187951", fontSize: 24, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Custom apparel intake</div>
        <div style={{ maxWidth: 940, marginTop: 20, fontSize: 68, lineHeight: 1.06, fontWeight: 800, letterSpacing: -3 }}>From inbox mess to quote-ready in minutes.</div>
      </div>
      <div style={{ fontSize: 24, color: "#65716b" }}>Evidence-backed details · Reviewable customer replies · Human-approved job specs</div>
    </div>,
    size,
  );
}
