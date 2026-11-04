import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { scanMetadata, stripMetadata } from "./image-metadata";
import { inspectMetadataFields } from "./metadata-inspection";

describe("real synthetic metadata fixtures", () => {
  for (const name of ["location.jpg", "location.webp", "notes.png"]) {
    it(`reads grouped fields and removes recognized blocks from ${name}`, async () => {
      const bytes = new Uint8Array(readFileSync(new URL(`./fixtures/metadata/${name}`, import.meta.url)));
      const before = scanMetadata(bytes)!;
      const inspection = await inspectMetadataFields(bytes, before);
      expect(inspection.fields.some(f => f.group === "Location")).toBe(true);
      if (name !== "notes.png") expect(inspection.fields.find(f => /ModifyDate/.test(f.label))?.value).toBe("2020:01:02 12:34:56");
      expect(inspection.fields.some(f => f.group === "Author")).toBe(true);
      expect(inspection.fields.some(f => f.group === "Software")).toBe(true);
      const output = stripMetadata(bytes);
      expect(scanMetadata(output)?.blocks).toEqual([]);
      expect(output.length).toBe(bytes.length - before.blocks.reduce((n,b) => n+b.bytes,0));
      expect(stripMetadata(output)).toEqual(output);
      expect((await inspectMetadataFields(output,scanMetadata(output)!)).fields).toEqual([]);
    });
  }
});
