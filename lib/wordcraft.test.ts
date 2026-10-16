import { describe, expect, it } from "vitest";
import { wordcraftFaqs, wordcraftRelease, wordcraftRuntimeUrl } from "./wordcraft";

describe("WordCraft public facts", () => {
  it("uses the shared apps host and a folder for the editor", () => {
    const url = new URL(wordcraftRuntimeUrl);
    expect(url.hostname).toBe("apps.briefvu.com");
    expect(url.pathname).toBe("/wordcraft/");
    expect(url.searchParams.get("from")).toBe("wordcraft-online");
  });

  it("pins the verified release and checksum", () => {
    expect(wordcraftRelease.version).toBe("0.7.0");
    expect(wordcraftRelease.releaseSha256).toHaveLength(64);
  });

  it("keeps FAQ questions unique", () => {
    const questions = wordcraftFaqs.map((faq) => faq.question);
    expect(new Set(questions).size).toBe(questions.length);
  });
});
