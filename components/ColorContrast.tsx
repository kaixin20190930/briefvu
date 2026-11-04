"use client";

import { useState } from "react";
import { contrastChecks, contrastRatio, parseHexColor } from "@/lib/color-contrast";
import { rgbToHex, type RgbColor } from "@/lib/image-color";

export function ColorContrast({ selected }: { selected: RgbColor | null }) {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#FFFFFF");
  const [alpha, setAlpha] = useState(255);
  const front = parseHexColor(foreground), back = parseHexColor(background);
  const ratio = front && back ? contrastRatio({ ...front, a: alpha }, back) : null;
  const checks = ratio === null ? null : contrastChecks(ratio);
  function useSelected() {
    if (!selected) return;
    setForeground(rgbToHex(selected.r, selected.g, selected.b)); setAlpha(selected.a ?? 255);
  }
  return <section className="color-contrast" aria-labelledby="contrast-title">
    <div className="color-controls"><h3 id="contrast-title">Check text contrast</h3><button type="button" disabled={!selected} onClick={useSelected}>Use picked color as text</button></div>
    <div className="contrast-inputs">
      <label>Text color (HEX)<input value={foreground} maxLength={7} spellCheck={false} aria-invalid={!front} onChange={(event) => setForeground(event.target.value)} /></label>
      <label>Background color (HEX)<input value={background} maxLength={7} spellCheck={false} aria-invalid={!back} onChange={(event) => setBackground(event.target.value)} /></label>
      <label>Text opacity: {Math.round(alpha / 255 * 100)}%<input type="range" min={0} max={255} value={alpha} onChange={(event) => setAlpha(Number(event.target.value))} /></label>
    </div>
    {ratio !== null && front && back && checks ? <>
      <div className="contrast-preview" style={{ backgroundColor: background }}><span style={{ color: `rgba(${front.r}, ${front.g}, ${front.b}, ${alpha / 255})` }}>The quick brown fox<br /><strong>Readable colors start here.</strong></span></div>
      <p className="contrast-ratio" role="status">Contrast ratio: <strong>{ratio.toFixed(2)}:1</strong></p>
      <div className="contrast-checks">{([
        ["Normal text AA", "4.5:1", checks.normalAA], ["Normal text AAA", "7:1", checks.normalAAA],
        ["Large text AA", "3:1", checks.largeAA], ["Large text AAA", "4.5:1", checks.largeAAA],
      ] as const).map(([label, threshold, pass]) => <p key={label}><strong>{label}</strong><span className={pass ? "contrast-pass" : "contrast-fail"}>{pass ? "Pass" : "Fail"} · {threshold}</span></p>)}</div>
    </> : <p role="alert">Enter both colors as six-digit HEX values, such as #136FE8.</p>}
    <p className="color-method-note">WCAG 2.x text contrast only, not a whole-page accessibility audit. Large text means at least 24 CSS px, or about 18.67 px when bold. Results use the unrounded ratio and composite text opacity over the opaque background. The preview is illustrative; check your final font and size.</p>
  </section>;
}
