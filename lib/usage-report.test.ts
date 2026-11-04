import { describe, expect, it } from "vitest";
import { usageCredentials, usageWindow, usageQuery, parseUsageResponse, usageHttpError } from "./usage-report";
describe("usage report", () => {
  it("prefers a dedicated read token without changing the legacy credential", () => {
    const env = { CLOUDFLARE_ACCOUNT_ID: "a".repeat(32), CLOUDFLARE_API_TOKEN: "old", BRIEFVU_ANALYTICS_API_TOKEN: "read-only" };
    expect(usageCredentials(env).token).toBe("read-only"); expect(env.CLOUDFLARE_API_TOKEN).toBe("old");
    expect(usageCredentials({ ...env, BRIEFVU_ANALYTICS_API_TOKEN: undefined }).token).toBe("old");
    expect(() => usageCredentials({})).toThrow();
  });
  it("uses an explicit reproducible UTC interval and JSON response", () => {
    const w=usageWindow(168,new Date("2026-11-01T13:00:00Z"));
    expect(w.from).toBe("2026-10-25T13:00:00.000Z");expect(usageQuery(w)).toContain("timestamp < toDateTime('2026-11-01 13:00:00')");expect(usageQuery(w)).toContain("FORMAT JSON");
    expect(() => usageWindow(0)).toThrow();expect(() => usageWindow(1.5)).toThrow();expect(() => usageWindow(24,new Date("bad"))).toThrow();
  });
  it("reads data from the API envelope, including string-encoded counts", () => {
    expect(parseUsageResponse({meta:[],data:[{tool:"image-to-ico",event:"export_completed",events:"7"}],rows:1})).toEqual([{tool:"image-to-ico",event:"export_completed",events:7}]);
    expect(parseUsageResponse({data:[],rows:0})).toEqual([]);
  });
  it("does not confuse unexpected or invalid responses with no usage", () => {
    expect(() => parseUsageResponse({success:false})).toThrow();expect(() => parseUsageResponse([])).toThrow();expect(() => parseUsageResponse({data:[{tool:"x",event:"y",events:"NaN"}]})).toThrow();
    expect(usageHttpError(403)).toContain("Account Analytics");expect(usageHttpError(500)).not.toContain("zero usage");
  });
});
