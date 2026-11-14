import { useEffect, useRef, useState } from "react";

type Preview = { file: File; url: string };

// Keep each selected occurrence alive; adding files must not revoke existing media.
export function reconcileAttachmentPreviews(
  previous: Preview[],
  files: File[],
  urls: Pick<typeof URL, "createObjectURL" | "revokeObjectURL"> = URL,
): Preview[] {
  const remaining = [...previous];
  const next = files.map(file => {
    const index = remaining.findIndex(preview => preview.file === file);
    if (index >= 0) {
      const [existing] = remaining.splice(index, 1);
      if (existing) return existing;
    }
    return { file, url: urls.createObjectURL(file) };
  });
  remaining.forEach(preview => urls.revokeObjectURL(preview.url));
  return next;
}

export function useAttachmentPreviews(files: File[]) {
  const live = useRef<Preview[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  useEffect(() => {
    live.current = reconcileAttachmentPreviews(live.current, files);
    setPreviews(live.current);
  }, [files]);
  useEffect(() => () => {
    live.current.forEach(preview => URL.revokeObjectURL(preview.url));
    live.current = [];
  }, []);
  return previews;
}