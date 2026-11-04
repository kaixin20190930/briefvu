import { describe, expect, it } from "vitest";
import { metadataFields, batchError, cleanedFilename } from "./metadata-fields";
describe("local metadata field groups", () => {
  it("preserves zero coordinates and groups sensitive fields", () => {
    const fields = metadataFields({ latitude: 0, GPSLongitude: [0, 0, 0], Model: "Test camera", DateTimeOriginal: new Date("2020-01-02T12:00:00Z"), Artist: "Test author", Software: "Editor" });
    expect(fields.map(f => f.group)).toEqual(["Location", "Location", "Device", "Time", "Author", "Software"]);
    expect(fields[0].value).toBe("0");
  });
  it("bounds untrusted fields, does not interpret HTML, and excludes binary data", () => {
    const fields = metadataFields({ nested: { city: "<script>test</script>" }, binary: new Uint8Array(100), description: "a".repeat(1000) });
    expect(fields).toHaveLength(2); expect(fields[0].value).toContain("<script>"); expect(fields[1].value).toHaveLength(500);
    expect(metadataFields(Object.fromEntries(Array.from({length:120},(_,i)=>[String(i),i])))).toHaveLength(100);
  });
  it("enforces batch limits and creates collision-free non-identifying filenames", () => {
    expect(batchError(Array.from({length:21},()=>({size:1})))).not.toBeNull();
    expect(batchError([{size:101*1024*1024}])).not.toBeNull();
    expect(batchError([{size:100*1024*1024}])).toBeNull();
    expect(cleanedFilename(0,"jpeg")).toBe("image-001-clean.jpg"); expect(cleanedFilename(1,"jpeg")).toBe("image-002-clean.jpg");
  });
});
