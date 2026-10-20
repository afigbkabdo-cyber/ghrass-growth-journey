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
