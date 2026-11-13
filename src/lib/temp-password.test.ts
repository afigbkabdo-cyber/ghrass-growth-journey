import { describe, expect, it } from "vitest";
import { generateTempPassword } from "./temp-password";

describe("generateTempPassword", () => {
  it("is 14 chars with upper, lower, digit and symbol", () => {
    for (let i = 0; i < 500; i++) {
      const p = generateTempPassword();
      expect(p).toHaveLength(14);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/[2-9]/);
      expect(p).toMatch(/[@#%+=!?]/);
    }
  });
  it("has no fixed prefix and does not repeat", () => {
    const set = new Set(Array.from({ length: 5000 }, () => generateTempPassword()));
    expect(set.size).toBe(5000);
    expect([...set].some((p) => p.startsWith("Ghiras"))).toBe(false);
  });
});
