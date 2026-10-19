import { describe, expect, it } from "vitest";
import { countTextGraphemes, reverseCharacters, reverseText, splitGraphemes } from "./text-reverser";

describe("text reverser", () => {
  it("reverses characters without breaking grapheme clusters", () => {
    expect(reverseCharacters("hello world")).toBe("dlrow olleh");
    expect(reverseCharacters("A👍🏽👨‍👩‍👧‍👦B")).toBe("B👨‍👩‍👧‍👦👍🏽A");
    expect(splitGraphemes("e\u0301👍🏽")).toHaveLength(2);
    expect(countTextGraphemes("e\u0301👍🏽")).toBe(2);
  });

  it("supports word, per-word and sentence reversal", () => {
    expect(reverseText("hello   world", "words")).toBe("world   hello");
    expect(reverseText("hello world", "each-word")).toBe("olleh dlrow");
    expect(reverseText("Hello. Goodbye!", "sentences")).toBe("Goodbye! Hello.");
  });

  it("keeps empty input stable", () => {
    expect(reverseText("", "characters")).toBe("");
    expect(reverseText("   ", "sentences")).toBe("   ");
  });
});
