/* رفع صور المحادثات إلى المخزن الخاص الحالي (message-photos). */
import { supabase } from "@/integrations/supabase/client";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 10 * 1024 * 1024;

/** يحوّل صور الجوال غير المدعومة (مثل HEIC من iPhone) أو الكبيرة إلى JPEG. */
export async function preparePhoto(file: File): Promise<Blob> {
  if (OK_TYPES.includes(file.type) && file.size <= MAX) return file;
  const looksImage = file.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name);
  if (!looksImage) throw new Error("unsupported");
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) throw new Error("unsupported");
  const scale = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob || blob.size > MAX) throw new Error("unsupported");
  return blob;
}

/** يرفع الصورة ويعيد مسارها داخل مجلد المحادثة/المرسل. */
export async function uploadMessagePhoto(threadId: string, blob: Blob): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("auth");
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${threadId}/${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("message-photos").upload(path, blob, { contentType: blob.type || "image/jpeg" });
  if (error) throw new Error("upload");
  return path;
}

export type MediaKind = "image" | "video";
export const MAX_FILES = 10;
const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };
export const VIDEO_MAX = 50 * 1024 * 1024;

export function isVideoFile(f: File) {
  return f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.name);
}

/** يجهّز ويرفع صورة أو فيديو؛ يعيد المسار والنوع. يرمي "video-size" أو "video-type" أو "unsupported". */
export async function uploadMessageMedia(threadId: string, file: File): Promise<{ path: string; kind: MediaKind }> {
  if (!isVideoFile(file)) {
    const blob = await preparePhoto(file);
    return { path: await uploadMessagePhoto(threadId, blob), kind: "image" };
  }
  const type = file.type || (/\.webm$/i.test(file.name) ? "video/webm" : /\.mov$/i.test(file.name) ? "video/quicktime" : "video/mp4");
  const ext = VIDEO_TYPES[type === "video/x-m4v" ? "video/mp4" : type];
  if (!ext) throw new Error("video-type");
  if (file.size > VIDEO_MAX) throw new Error("video-size");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("auth");
  const path = `${threadId}/${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("message-photos").upload(path, file, { contentType: type === "video/x-m4v" ? "video/mp4" : type });
  if (error) throw new Error("upload");
  return { path, kind: "video" };
}
