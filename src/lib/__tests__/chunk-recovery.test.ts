import { describe, expect, it, vi } from "vitest";
import { isChunkLoadError, recoverChunkLoad } from "../chunk-recovery";

function browser() {
  const values = new Map<string, string>();
  return {
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    },
    location: { reload: vi.fn() },
  };
}

describe("stale route module recovery", () => {
  const error = new TypeError("Failed to fetch dynamically imported module: /assets/admin.index-CEOd1Kp1.js");
  it("reloads the document for the reported missing route module", () => {
    const target = browser();
    expect(recoverChunkLoad(error, target, 100_000)).toBe(true);
    expect(target.location.reload).toHaveBeenCalledTimes(1);
  });
  it("prevents repeated automatic reloads after a persistent failure", () => {
    const target = browser();
    recoverChunkLoad(error, target, 100_000);
    expect(recoverChunkLoad(error, target, 100_001)).toBe(false);
    expect(target.location.reload).toHaveBeenCalledTimes(1);
  });
  it("leaves unrelated application errors alone", () => {
    const target = browser();
    expect(recoverChunkLoad(new Error("Forbidden"), target, 100_000)).toBe(false);
    expect(target.location.reload).not.toHaveBeenCalled();
    expect(isChunkLoadError(null)).toBe(false);
  });
  it("does not reload automatically when the guard cannot be saved", () => {
    const target = browser();
    target.sessionStorage.setItem = () => { throw new Error("Storage blocked"); };
    expect(recoverChunkLoad(error, target, 100_000)).toBe(false);
    expect(target.location.reload).not.toHaveBeenCalled();
  });
});