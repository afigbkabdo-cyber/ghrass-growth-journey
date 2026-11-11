import { describe, it, expect } from "vitest";
import { stableMedia } from "@/components/message-photo";
describe("stable attachment links", () => {
  it("keeps the first link for the same file across refreshes", () => {
    const a = stableMedia({ path: "t/u/x.jpg", url: "u1", downloadUrl: null, kind: "image" }, 1000);
    const b = stableMedia({ path: "t/u/x.jpg", url: "u2", downloadUrl: null, kind: "image" }, 1000 + 15000);
    expect(b.url).toBe(a.url);
  });
  it("renews the link after 45 minutes, before the 1-hour link expires", () => {
    stableMedia({ path: "t/u/y.mp4", url: "v1", downloadUrl: null, kind: "video" }, 0);
    expect(stableMedia({ path: "t/u/y.mp4", url: "v2", downloadUrl: null, kind: "video" }, 46 * 60000).url).toBe("v2");
  });
});
