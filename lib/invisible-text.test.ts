import { describe, expect, it } from "vitest";
import {
  analyzeInvisibleText,
  clampInvisibleCount,
  formatCodePoint,
  generateInvisibleText,
  getInvisibleCharacter,
  INVISIBLE_CHARACTERS,
  verifyPasteBack,
} from "./invisible-text";

describe("invisible character catalog", () => {
  it("defines the expected code point, Unicode category and semantics", () => {
    expect(
      INVISIBLE_CHARACTERS.map(({ id, codePoint, unicodeCategory, width }) => ({
        id,
        codePoint,
        unicodeCategory,
        width,
      })),
    ).toEqual([
      { id: "hangul-filler", codePoint: "U+3164", unicodeCategory: "Lo", width: "blank glyph" },
      { id: "braille-blank", codePoint: "U+2800", unicodeCategory: "So", width: "blank glyph" },
      { id: "zero-width-space", codePoint: "U+200B", unicodeCategory: "Cf", width: "zero width" },
      { id: "word-joiner", codePoint: "U+2060", unicodeCategory: "Cf", width: "zero width" },
      { id: "no-break-space", codePoint: "U+00A0", unicodeCategory: "Zs", width: "space width" },
    ]);
    expect(INVISIBLE_CHARACTERS.every((entry) => entry.semantics && entry.caution)).toBe(true);
  });

  it("looks up the recommended character", () => {
    expect(getInvisibleCharacter("hangul-filler").recommended).toBe(true);
  });
});

describe("generation", () => {
  it.each(INVISIBLE_CHARACTERS)("generates the requested $name count", (entry) => {
    const output = generateInvisibleText(entry.id, 17);
    expect(Array.from(output)).toHaveLength(17);
    expect(Array.from(output).every((character) => character === entry.character)).toBe(true);
  });

  it.each([
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
    [-10, 1],
    [0, 1],
    [1.9, 1],
    [500, 500],
    [999, 500],
  ])("clamps %s to %s", (value, expected) => {
    expect(clampInvisibleCount(value)).toBe(expected);
  });

  it("respects the 500 code-point boundary", () => {
    expect(Array.from(generateInvisibleText("zero-width-space", 501))).toHaveLength(500);
  });
});

describe("analysis", () => {
  it("classifies the three categories exclusively", () => {
    const input = "\u3164\u2800\u200B\u2060\u00A0 \tA🙂";
    const result = analyzeInvisibleText(input);

    expect(result).toMatchObject({
      totalCodePoints: 9,
      supportedCharacters: 5,
      otherWhitespace: 2,
      otherCodePoints: 2,
      hasVisibleContent: true,
    });
    expect(
      result.supportedCharacters + result.otherWhitespace + result.otherCodePoints,
    ).toBe(result.totalCodePoints);
  });

  it("handles empty input and unpaired surrogates", () => {
    expect(analyzeInvisibleText("")).toEqual({
      totalCodePoints: 0,
      supportedCharacters: 0,
      otherWhitespace: 0,
      otherCodePoints: 0,
      hasVisibleContent: false,
      codePoints: [],
    });
    expect(analyzeInvisibleText("\uD800")).toMatchObject({
      totalCodePoints: 1,
      otherCodePoints: 1,
      codePoints: ["U+D800"],
    });
  });

  it("formats BMP and supplementary code points", () => {
    expect(formatCodePoint("\u200B")).toBe("U+200B");
    expect(formatCodePoint("🙂")).toBe("U+1F642");
    expect(formatCodePoint("")).toBe("");
  });
});

describe("paste-back verification", () => {
  const expected = generateInvisibleText("hangul-filler", 3);

  it("requires a copied expected payload", () => {
    expect(verifyPasteBack(null, expected).status).toBe("no_expected_payload");
  });

  it("reports exact, removed, changed and extra-visible outcomes", () => {
    expect(verifyPasteBack(expected, expected).status).toBe("exact_match");
    expect(verifyPasteBack(expected, "").status).toBe("empty");
    expect(verifyPasteBack(expected, "\u200B").status).toBe("changed_or_normalized");
    expect(verifyPasteBack(expected, `${expected}hello`).status).toBe("extra_visible_content");
  });

  it("recognizes NFKC normalization for Hangul Filler and NBSP", () => {
    const hangul = generateInvisibleText("hangul-filler", 2);
    const nbsp = generateInvisibleText("no-break-space", 2);

    expect(hangul.normalize("NFKC")).toBe("\u1160\u1160");
    expect(nbsp.normalize("NFKC")).toBe("  ");
    expect(verifyPasteBack(hangul, hangul.normalize("NFKC")).status).toBe("changed_or_normalized");
    expect(verifyPasteBack(nbsp, nbsp.normalize("NFKC")).status).toBe("changed_or_normalized");
  });

  it("documents NFC and NFKC behavior for all five characters", () => {
    const normalizationResults = Object.fromEntries(
      INVISIBLE_CHARACTERS.map((entry) => [entry.codePoint, {
        NFC: entry.character.normalize("NFC"),
        NFKC: entry.character.normalize("NFKC"),
      }]),
    );

    expect(normalizationResults).toEqual({
      "U+3164": { NFC: "\u3164", NFKC: "\u1160" },
      "U+2800": { NFC: "\u2800", NFKC: "\u2800" },
      "U+200B": { NFC: "\u200B", NFKC: "\u200B" },
      "U+2060": { NFC: "\u2060", NFKC: "\u2060" },
      "U+00A0": { NFC: "\u00A0", NFKC: " " },
    });
  });
});
