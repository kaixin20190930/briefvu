import { splitGraphemes } from "./text-reverser";

export type CharacterRemovalOptions = {
  punctuation: boolean;
  numbers: boolean;
  horizontalSpaces: boolean;
  lineBreaks: boolean;
  symbols: boolean;
  emoji: boolean;
  customCharacters: string;
};

export type CharacterRemovalResult = {
  output: string;
  originalCharacters: number;
  cleanedCharacters: number;
  removedCharacters: number;
};

const punctuationPattern = /\p{P}/u;
const numberPattern = /\p{N}/u;
const symbolPattern = /\p{S}/u;
const emojiPattern = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u;
const horizontalSpacePattern = /[^\S\r\n\u2028\u2029]/u;
const lineBreakPattern = /[\r\n\u2028\u2029]/u;

export const DEFAULT_CHARACTER_REMOVAL_OPTIONS: CharacterRemovalOptions = {
  punctuation: true,
  numbers: false,
  horizontalSpaces: false,
  lineBreaks: false,
  symbols: false,
  emoji: false,
  customCharacters: "",
};

function shouldRemoveCodePoint(character: string, options: CharacterRemovalOptions) {
  return (
    (options.punctuation && punctuationPattern.test(character)) ||
    (options.numbers && numberPattern.test(character)) ||
    (options.horizontalSpaces && horizontalSpacePattern.test(character)) ||
    (options.lineBreaks && lineBreakPattern.test(character)) ||
    (options.symbols && symbolPattern.test(character))
  );
}

export function removeCharacters(
  input: string,
  options: CharacterRemovalOptions,
): CharacterRemovalResult {
  const custom = new Set(splitGraphemes(options.customCharacters));
  const original = splitGraphemes(input);
  const output = original
    .filter((grapheme) => {
      if (custom.has(grapheme)) return false;
      if (options.emoji && emojiPattern.test(grapheme)) return false;
      return true;
    })
    .map((grapheme) => Array.from(grapheme).filter((character) => !shouldRemoveCodePoint(character, options)).join(""))
    .join("");
  const cleanedCharacters = splitGraphemes(output).length;

  return {
    output,
    originalCharacters: original.length,
    cleanedCharacters,
    removedCharacters: original.length - cleanedCharacters,
  };
}
