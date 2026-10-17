import { describe, expect, it } from "vitest";
import {
  photocraftFaqs,
  photocraftRelease,
  photocraftRuntimeUrl,
} from "./photocraft";

describe("PhotoCraft public facts", () => {
  it("uses the shared apps host and a folder for the editor", () => {
    const url = new URL(photocraftRuntimeUrl);
    expect(url.hostname).toBe("apps.briefvu.com");
    expect(url.pathname).toBe("/photocraft/");
    expect(url.searchParams.get("from")).toBe("photocraft-online");
  });

  it("pins the verified release and checksum", () => {
    expect(photocraftRelease.version).toBe("0.9.0");
    expect(photocraftRelease.releaseSha256).toHaveLength(64);
  });

  it("keeps FAQ questions unique", () => {
    const questions = photocraftFaqs.map((faq) => faq.question);
    expect(new Set(questions).size).toBe(questions.length);
  });
});
