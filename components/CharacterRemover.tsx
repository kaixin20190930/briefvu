"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { DEFAULT_CHARACTER_REMOVAL_OPTIONS, removeCharacters, type CharacterRemovalOptions } from "@/lib/character-remover";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const toggles: { key: keyof Omit<CharacterRemovalOptions, "customCharacters">; label: string }[] = [
  { key: "punctuation", label: "Punctuation" }, { key: "numbers", label: "Numbers" },
  { key: "horizontalSpaces", label: "Spaces and tabs" }, { key: "lineBreaks", label: "Line breaks" },
  { key: "symbols", label: "Symbols" }, { key: "emoji", label: "Emoji" },
];

export function CharacterRemover() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(DEFAULT_CHARACTER_REMOVAL_OPTIONS);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => removeCharacters(input, options), [input, options]);

  function updateInput(value: string) { setInput(value); if (value) trackToolStarted("character-remover"); }
  function setOption<K extends keyof CharacterRemovalOptions>(key: K, value: CharacterRemovalOptions[K]) { setOptions((current) => ({ ...current, [key]: value })); }
  async function copyOutput() {
    if (!result.output) return;
    try { await navigator.clipboard.writeText(result.output); setCopied(true); trackToolEvent("character-remover", "copy_completed"); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  }

  return (
    <section className="text-tool-shell" aria-labelledby="character-remover-title">
      <div className="generator-heading">
        <div><span className="section-label">Clean text locally</span><h2 id="character-remover-title">Select what you want to remove</h2><p>The output updates as you type. Line breaks stay separate from ordinary spaces.</p></div>
        <span className="local-badge">Runs in your browser</span>
      </div>
      <fieldset className="removal-options"><legend>Remove</legend>
        <div>{toggles.map((item) => <label key={item.key}><input checked={options[item.key]} onChange={(event) => setOption(item.key, event.target.checked)} type="checkbox" /><span>{item.label}</span></label>)}</div>
        <label className="custom-character-field"><span>Custom characters</span><input value={options.customCharacters} onChange={(event) => setOption("customCharacters", event.target.value)} placeholder="Example: #@$" /><small>Enter the exact characters to remove. No commas are required.</small></label>
      </fieldset>
      <div className="text-workspace">
        <label><span>Original text <small>{result.originalCharacters} characters</small></span><textarea value={input} onChange={(event) => updateInput(event.target.value)} placeholder="Paste text to clean…" /></label>
        <label><span>Cleaned result <small>{result.removedCharacters} removed</small></span><textarea value={result.output} readOnly placeholder="The cleaned result appears here." /></label>
      </div>
      <div className="text-tool-actions">
        <button className="button-primary" disabled={!result.output} onClick={() => void copyOutput()} type="button">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copied" : "Copy cleaned text"}</button>
        <button className="button-secondary" onClick={() => { setInput(""); setOptions(DEFAULT_CHARACTER_REMOVAL_OPTIONS); }} type="button"><RotateCcw size={17} />Reset</button>
      </div>
    </section>
  );
}
