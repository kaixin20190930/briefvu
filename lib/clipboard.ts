/** Clipboard failure leaves the visible value available for manual copying. */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true; }
  } catch { /* Try the selection-based fallback below. */ }
  const previous = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = value; field.readOnly = true;
  field.style.position = "fixed"; field.style.opacity = "0";
  document.body.appendChild(field); field.select();
  try { return document.execCommand("copy"); }
  catch { return false; }
  finally { field.remove(); previous?.focus(); }
}
