"use client";

import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { countTextGraphemes, reverseText, type TextReverseMode } from "@/lib/text-reverser";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const modes: { value: TextReverseMode; label: string }[] = [
  { value: "characters", label: "Characters" },
  { value: "words", label: "Word order" },
  { value: "each-word", label: "Each word" },
  { value: "sentences", label: "Sentences" },
];

export function TextReverser() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TextReverseMode>("characters");
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => reverseText(input, mode), [input, mode]);

  function updateInput(value: string) {
    setInput(value);
    if (value) trackToolStarted("text-reverser");
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      trackToolEvent("text-reverser", "copy_completed");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="text-tool-shell" aria-labelledby="text-reverser-title">
      <div className="generator-heading">
        <div><span className="section-label">Reverse text locally</span><h2 id="text-reverser-title">Choose how to reverse your text</h2><p>Unicode-aware reversal keeps combined emoji and accented characters intact.</p></div>
        <span className="local-badge">Runs in your browser</span>
      </div>
      <div className="text-mode-picker" role="group" aria-label="Reverse mode">
        {modes.map((item) => <button className={mode === item.value ? "active" : ""} key={item.value} onClick={() => setMode(item.value)} type="button">{item.label}</button>)}
      </div>
      <div className="text-workspace">
        <label><span>Original text <small>{countTextGraphemes(input)} characters</small></span><textarea value={input} onChange={(event) => updateInput(event.target.value)} placeholder="Type or paste text here…" /></label>
        <label><span>Reversed result <small>{countTextGraphemes(output)} characters</small></span><textarea value={output} readOnly placeholder="Your reversed text appears here." /></label>
      </div>
      <div className="text-tool-actions">
        <button className="button-primary" disabled={!output} onClick={() => void copyOutput()} type="button">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copied" : "Copy result"}</button>
        <button className="button-secondary" disabled={!output} onClick={() => updateInput(output)} type="button"><ArrowLeftRight size={17} />Use result as input</button>
        <button className="button-secondary" disabled={!input} onClick={() => setInput("")} type="button"><RotateCcw size={17} />Clear</button>
      </div>
    </section>
  );
}
