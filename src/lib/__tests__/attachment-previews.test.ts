import { describe, expect, it, vi } from "vitest";
import { reconcileAttachmentPreviews } from "../../hooks/use-attachment-previews";

function fixture() {
  let id = 0;
  const urls = {
    createObjectURL: vi.fn(() => `blob:preview-${++id}`),
    revokeObjectURL: vi.fn(),
  };
  const files = [
    new File(["image1"], "first.jpg", { type: "image/jpeg" }),
    new File(["image2"], "second.jpg", { type: "image/jpeg" }),
    new File(["video1"], "first.mov", { type: "video/quicktime" }),
    new File(["video2"], "second.mp4", { type: "video/mp4" }),
  ] as const;
  return { files, urls };
}

describe("selected attachment lifetime", () => {
  it("retains two images and two videos selected consecutively without revocation", () => {
    const { files, urls } = fixture();
    let previews: ReturnType<typeof reconcileAttachmentPreviews> = [];
    for (let count = 1; count <= 4; count++) {
      const previous = previews;
      previews = reconcileAttachmentPreviews(previews, files.slice(0, count), urls);
      expect(previews).toHaveLength(count);
      previous.forEach((preview, index) => expect(previews[index]).toBe(preview));
    }
    expect(urls.createObjectURL).toHaveBeenCalledTimes(4);
    expect(urls.revokeObjectURL).not.toHaveBeenCalled();
  });
  it("supports selecting the same file again as a separate occurrence", () => {
    const { files, urls } = fixture();
    const first = reconcileAttachmentPreviews([], [files[0]], urls);
    const next = reconcileAttachmentPreviews(first, [files[0], files[0]], urls);
    expect(next).toHaveLength(2);
    expect(next[0]).toBe(first[0]);
    expect(next[1]?.url).not.toBe(next[0]?.url);
    expect(urls.revokeObjectURL).not.toHaveBeenCalled();
  });
  it("only revokes removed previews, and releases the rest when cleared after sending", () => {
    const { files, urls } = fixture();
    const first = reconcileAttachmentPreviews([], [...files], urls);
    const next = reconcileAttachmentPreviews(first, [files[0], files[2], files[3]], urls);
    expect(urls.revokeObjectURL.mock.calls).toEqual([[first[1]?.url]]);
    expect(next[1]).toBe(first[2]);
    expect(reconcileAttachmentPreviews(next, [], urls)).toEqual([]);
    expect(urls.revokeObjectURL).toHaveBeenCalledTimes(4);
  });
  it("keeps previews unchanged on a cancelled selection or a background refresh", () => {
    const { files, urls } = fixture();
    const first = reconcileAttachmentPreviews([], [...files], urls);
    const next = reconcileAttachmentPreviews(first, [...files], urls);
    expect(next).toEqual(first);
    expect(urls.createObjectURL).toHaveBeenCalledTimes(4);
    expect(urls.revokeObjectURL).not.toHaveBeenCalled();
  });
});