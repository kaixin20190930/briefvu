export const MIN_INVISIBLE_COUNT = 1;
export const MAX_INVISIBLE_COUNT = 500;

export type InvisibleCharacterId =
  | "hangul-filler"
  | "braille-blank"
  | "zero-width-space"
  | "word-joiner"
  | "no-break-space";

export type InvisibleCharacter = {
  id: InvisibleCharacterId;
  name: string;
  character: string;
  codePoint: string;
  unicodeCategory: "Lo" | "So" | "Cf" | "Zs";
  width: "blank glyph" | "zero width" | "space width";
  semantics: string;
  caution: string;
  recommended?: boolean;
};

export const INVISIBLE_CHARACTERS: readonly InvisibleCharacter[] = [
  {
    id: "hangul-filler",
    name: "General blank (Hangul Filler)",
    character: "\u3164",
    codePoint: "U+3164",
    unicodeCategory: "Lo",
    width: "blank glyph",
    semantics: "A Hangul letter with a blank appearance in many fonts.",
    caution: "May be removed or normalized to U+1160 by some systems.",
    recommended: true,
  },
  {
    id: "braille-blank",
    name: "Braille Pattern Blank",
    character: "\u2800",
    codePoint: "U+2800",
    unicodeCategory: "So",
    width: "blank glyph",
    semantics: "A blank braille pattern that often occupies visible width.",
    caution: "It is a symbol, not a space, and may display differently by font.",
  },
  {
    id: "zero-width-space",
    name: "Zero Width Space",
    character: "\u200B",
    codePoint: "U+200B",
    unicodeCategory: "Cf",
    width: "zero width",
    semantics: "A formatting control that permits a line-break opportunity.",
    caution: "Platforms commonly strip default-ignorable format controls.",
  },
  {
    id: "word-joiner",
    name: "Word Joiner",
    character: "\u2060",
    codePoint: "U+2060",
    unicodeCategory: "Cf",
    width: "zero width",
    semantics: "A formatting control that prevents a line break at its position.",
    caution: "It may be stripped and is not intended as a general blank space.",
  },
  {
    id: "no-break-space",
    name: "No-Break Space",
    character: "\u00A0",
    codePoint: "U+00A0",
    unicodeCategory: "Zs",
    width: "space width",
    semantics: "A Unicode space that prevents a line break.",
    caution: "It is whitespace and may normalize to an ordinary space.",
  },
] as const;

const characterById = new Map(
  INVISIBLE_CHARACTERS.map((entry) => [entry.id, entry] as const),
);
const supportedCharacterSet = new Set(
  INVISIBLE_CHARACTERS.map((entry) => entry.character),
);
const unicodeWhitespace = /^\p{White_Space}$/u;
const visibleCodePoint = /[^\p{White_Space}\p{Default_Ignorable_Code_Point}\u2800]/u;

export function clampInvisibleCount(value: number): number {
  if (!Number.isFinite(value)) return MIN_INVISIBLE_COUNT;
  return Math.min(
    MAX_INVISIBLE_COUNT,
    Math.max(MIN_INVISIBLE_COUNT, Math.trunc(value)),
  );
}

export function getInvisibleCharacter(
  id: InvisibleCharacterId,
): InvisibleCharacter {
  const entry = characterById.get(id);
  if (!entry) throw new Error(`Unknown invisible character: ${id}`);
  return entry;
}

export function generateInvisibleText(
  id: InvisibleCharacterId,
  requestedCount: number,
): string {
  const count = clampInvisibleCount(requestedCount);
  return getInvisibleCharacter(id).character.repeat(count);
}

export function formatCodePoint(character: string): string {
  const value = character.codePointAt(0);
  return value === undefined
    ? ""
    : `U+${value.toString(16).toUpperCase().padStart(4, "0")}`;
}

export type InvisibleTextAnalysis = {
  totalCodePoints: number;
  supportedCharacters: number;
  otherWhitespace: number;
  otherCodePoints: number;
  hasVisibleContent: boolean;
  codePoints: string[];
};

export function analyzeInvisibleText(input: string): InvisibleTextAnalysis {
  const characters = Array.from(input);
  let supportedCharacters = 0;
  let otherWhitespace = 0;
  let otherCodePoints = 0;

  for (const character of characters) {
    if (supportedCharacterSet.has(character)) {
      supportedCharacters += 1;
    } else if (unicodeWhitespace.test(character)) {
      otherWhitespace += 1;
    } else {
      otherCodePoints += 1;
    }
  }

  return {
    totalCodePoints: characters.length,
    supportedCharacters,
    otherWhitespace,
    otherCodePoints,
    hasVisibleContent: characters.some((character) => visibleCodePoint.test(character)),
    codePoints: characters.map(formatCodePoint),
  };
}

export type VerificationStatus =
  | "no_expected_payload"
  | "empty"
  | "exact_match"
  | "changed_or_normalized"
  | "extra_visible_content";

export type PasteBackVerification = {
  status: VerificationStatus;
  analysis: InvisibleTextAnalysis;
};

export function verifyPasteBack(
  expectedPayload: string | null,
  pastedValue: string,
): PasteBackVerification {
  const analysis = analyzeInvisibleText(pastedValue);

  if (expectedPayload === null) {
    return { status: "no_expected_payload", analysis };
  }
  if (pastedValue.length === 0) {
    return { status: "empty", analysis };
  }
  if (pastedValue === expectedPayload) {
    return { status: "exact_match", analysis };
  }

  const expectedNormalizations = new Set([
    expectedPayload.normalize("NFC"),
    expectedPayload.normalize("NFKC"),
  ]);
  if (expectedNormalizations.has(pastedValue)) {
    return { status: "changed_or_normalized", analysis };
  }

  if (analysis.hasVisibleContent) {
    return { status: "extra_visible_content", analysis };
  }

  return { status: "changed_or_normalized", analysis };
}
