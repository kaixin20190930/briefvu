import { describe, expect, it } from "vitest";
import { DEFAULT_CHARACTER_REMOVAL_OPTIONS, removeCharacters } from "./character-remover";

describe("character remover", () => {
  it("removes Unicode punctuation while preserving letters and accents", () => {
    const result = removeCharacters("Hello, 世界！ café—ok?", DEFAULT_CHARACTER_REMOVAL_OPTIONS);
    expect(result.output).toBe("Hello 世界 caféok");
    expect(result.removedCharacters).toBe(4);
  });

  it("separates numbers, horizontal whitespace and line breaks", () => {
    expect(removeCharacters("A 1\tB\nC٢", { ...DEFAULT_CHARACTER_REMOVAL_OPTIONS, punctuation: false, numbers: true }).output).toBe("A \tB\nC");
    expect(removeCharacters("A \tB\nC", { ...DEFAULT_CHARACTER_REMOVAL_OPTIONS, punctuation: false, horizontalSpaces: true }).output).toBe("AB\nC");
    expect(removeCharacters("A \tB\nC", { ...DEFAULT_CHARACTER_REMOVAL_OPTIONS, punctuation: false, lineBreaks: true }).output).toBe("A \tBC");
  });

  it("removes whole emoji graphemes and exact custom characters", () => {
    const result = removeCharacters("Keep 👍🏽 and 👨‍👩‍👧‍👦, remove #@$", {
      ...DEFAULT_CHARACTER_REMOVAL_OPTIONS,
      punctuation: false,
      emoji: true,
      customCharacters: "#@$",
    });
    expect(result.output).toBe("Keep  and , remove ");
  });
});
