export type TextReverseMode = "characters" | "words" | "each-word" | "sentences";

export function splitGraphemes(value: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
}

export function reverseCharacters(value: string): string {
  return splitGraphemes(value).reverse().join("");
}

function reverseNonWhitespaceTokens(value: string): string {
  const tokens = value.match(/\S+/gu) ?? [];
  let nextToken = tokens.length - 1;
  return value.replace(/\S+/gu, () => tokens[nextToken--] ?? "");
}

function reverseEachWord(value: string): string {
  return value.replace(/\S+/gu, (word) => reverseCharacters(word));
}

function reverseSentences(value: string): string {
  if (!value.trim()) return value;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });
    const sentences = Array.from(segmenter.segment(value), ({ segment }) => segment.trim()).filter(Boolean);
    return sentences.reverse().join(" ");
  }
  const sentences = value.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/gu) ?? [value];
  return sentences.map((sentence) => sentence.trim()).filter(Boolean).reverse().join(" ");
}

export function reverseText(value: string, mode: TextReverseMode): string {
  switch (mode) {
    case "characters":
      return reverseCharacters(value);
    case "words":
      return reverseNonWhitespaceTokens(value);
    case "each-word":
      return reverseEachWord(value);
    case "sentences":
      return reverseSentences(value);
  }
}

export function countTextGraphemes(value: string): number {
  return splitGraphemes(value).length;
}
