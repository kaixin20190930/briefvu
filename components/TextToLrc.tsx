"use client";

import { Check, Clock3, Copy, Download, RotateCcw, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { autoIncrementLrcLines, buildLrc, formatLrcTimestamp, isLrcReady, offsetLrcLines, parseLrcTimestamp, parseLyrics, sanitizeLrcFilename, type LrcLine } from "@/lib/text-to-lrc";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const MAX_AUDIO_BYTES = 200 * 1024 * 1024;

export function TextToLrc() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [lyrics, setLyrics] = useState("");
  const [lines, setLines] = useState<LrcLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [audio, setAudio] = useState<{ name: string; url: string } | null>(null);
  const [start, setStart] = useState("00:00.00");
  const [interval, setInterval] = useState(4);
  const [offset, setOffset] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const preview = useMemo(() => buildLrc(lines), [lines]);
  const ready = isLrcReady(lines);

  useEffect(() => () => { if (audio) URL.revokeObjectURL(audio.url); }, [audio]);

  function updateLyrics(value: string) { setLyrics(value); setLines(parseLyrics(value)); setActiveIndex(0); if (value) trackToolStarted("text-to-lrc"); }
  function loadAudio(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("audio/") || file.size > MAX_AUDIO_BYTES) { setMessage("Choose a browser-supported audio file smaller than 200 MB."); return; }
    if (audio) URL.revokeObjectURL(audio.url);
    setAudio({ name: file.name, url: URL.createObjectURL(file) }); setMessage(null); trackToolStarted("text-to-lrc"); trackToolEvent("text-to-lrc", "file_loaded");
  }
  function stampCurrent() {
    const player = audioRef.current;
    if (!player || !lines.length) return;
    setLines((current) => current.map((line, index) => index === activeIndex ? { ...line, timeSeconds: player.currentTime } : line));
    const next = lines.findIndex((line, index) => index > activeIndex && line.text.trim());
    if (next >= 0) setActiveIndex(next);
  }
  async function copyLrc() {
    if (!ready) return;
    try { await navigator.clipboard.writeText(preview); setMessage("LRC copied."); trackToolEvent("text-to-lrc", "copy_completed"); } catch { setMessage("Copy failed. Select the preview and copy it manually."); }
  }
  function downloadLrc() {
    if (!ready) return;
    const url = URL.createObjectURL(new Blob([preview], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = sanitizeLrcFilename(audio?.name ?? "lyrics"); link.click(); URL.revokeObjectURL(url); trackToolEvent("text-to-lrc", "export_completed");
  }

  return (
    <section className="lrc-tool-shell" aria-labelledby="lrc-tool-title">
      <div className="generator-heading"><div><span className="section-label">Create synced lyrics</span><h2 id="lrc-tool-title">Turn lyric lines into an LRC file</h2><p>Load audio locally, stamp each line, then copy or download the finished file.</p></div><span className="local-badge">Audio stays on your device</span></div>
      <div className="lrc-input-grid">
        <label><span>1. Paste one lyric line per row</span><textarea value={lyrics} onChange={(event) => updateLyrics(event.target.value)} placeholder={'First line\nSecond line\nThird line'} /></label>
        <div><span>2. Load an audio file</span><label className="audio-upload"><Upload size={19} /><strong>{audio?.name ?? "Choose audio"}</strong><small>Browser-supported audio, up to 200 MB</small><input accept="audio/*" onChange={(event) => loadAudio(event.target.files?.[0])} type="file" /></label>{audio && <audio controls ref={audioRef} src={audio.url} />}</div>
      </div>
      <div className="lrc-controls">
        <button className="button-primary" disabled={!audio || !lines.some((line) => line.text.trim())} onClick={stampCurrent} type="button"><Clock3 size={17} />Stamp current time</button>
        <label>Start time<input value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Seconds per line<input min="0.1" step="0.1" type="number" value={interval} onChange={(event) => setInterval(Number(event.target.value))} /></label>
        <button className="button-secondary" onClick={() => { const parsed = parseLrcTimestamp(start); if (parsed === null) { setMessage("Use a start time like 00:12.50."); return; } setLines((current) => autoIncrementLrcLines(current, parsed, interval)); }} type="button">Auto-fill</button>
        <label>Offset seconds<input step="0.1" type="number" value={offset} onChange={(event) => setOffset(Number(event.target.value))} /></label>
        <button className="button-secondary" onClick={() => setLines((current) => offsetLrcLines(current, offset))} type="button">Apply offset</button>
      </div>
      <p className="lrc-help">Auto-fill creates an estimated timing scaffold; it does not detect vocals. Use the player and Stamp button for accurate synchronization.</p>
      <div className="lrc-line-list" aria-label="Lyric timing rows">
        {lines.filter((line) => line.text.trim()).map((line) => { const index = lines.indexOf(line); return <button className={index === activeIndex ? "active" : ""} key={`${index}-${line.text}`} onClick={() => setActiveIndex(index)} type="button"><code>{line.timeSeconds === null ? "[--:--.--]" : formatLrcTimestamp(line.timeSeconds)}</code><span>{line.text}</span></button>; })}
        {!lines.some((line) => line.text.trim()) && <p>Paste lyrics to create timing rows.</p>}
      </div>
      <label className="lrc-preview"><span>LRC preview</span><textarea readOnly value={preview} placeholder="Your LRC file appears here." /></label>
      <div className="text-tool-actions">
        <button className="button-primary" disabled={!ready} onClick={() => void copyLrc()} type="button"><Copy size={17} />Copy LRC</button>
        <button className="button-secondary" disabled={!ready} onClick={downloadLrc} type="button"><Download size={17} />Download .lrc</button>
        <button className="button-secondary" onClick={() => setLines((current) => current.map((line) => ({ ...line, timeSeconds: null })))} type="button"><RotateCcw size={17} />Reset timing</button>
        {message && <span className="lrc-message"><Check size={15} />{message}</span>}
      </div>
    </section>
  );
}
