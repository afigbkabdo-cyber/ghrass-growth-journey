/* رفع صور المحادثات إلى المخزن الخاص الحالي (message-photos). */
import { supabase } from "@/integrations/supabase/client";
import { mediaType, videoFileInfo, MAX_FILES, VIDEO_MAX } from './message-media';
export { MAX_FILES, VIDEO_MAX };

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 10 * 1024 * 1024;

type FailureStage = "validation" | "read" | "auth" | "start" | "upload" | "save";
type FailureKind = "file-read" | "start" | "connection" | "storage" | "auth" | "unknown" | "unsupported" | "video-type" | "video-size";

/** The original cause stays in memory; only redacted diagnostic fields are logged. */
export class MessageAttachmentError extends Error {
  constructor(
    public readonly stage: FailureStage,
    public readonly kind: FailureKind,
    cause: unknown,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(kind, { cause });
    this.name = "MessageAttachmentError";
  }
}

function errorField(error: unknown, key: string): unknown {
  if (!error || typeof error !== "object") return undefined;
  try { return Reflect.get(error, key); } catch { return undefined; }
}

function safeDetail(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  return String(value)
    .replace(/https?:\/\/\S+|blob:\S+/gi, "[url]")
    .replace(/\b(?:Bearer\s+\S+|(?:sb_(?:secret|publishable)_)[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+)\b/gi, "[credential]")
    .replace(/\b(?:authorization|apikey|api_key|token|password|secret|cookie)\b\s*[:=]\s*[^\s,;]+/gi, "[credential]")
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[email]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, "[id]")
    .replace(/(?:[\w.-]+\/)+[\w.%+-]+/g, "[path]")
    .slice(0, 350);
}

export function diagnoseMessageAttachmentError(cause: unknown, stage: FailureStage): MessageAttachmentError {
  if (cause instanceof MessageAttachmentError) return cause;
  const message = errorField(cause, "message");
  const name = errorField(cause, "name");
  const rawCode = errorField(cause, "code") ?? errorField(cause, "error");
  const rawStatus = errorField(cause, "statusCode") ?? errorField(cause, "status");
  const status = typeof rawStatus === "number" || typeof rawStatus === "string" ? Number(rawStatus) : undefined;
  const text = [name, message, rawCode].filter(v => typeof v === "string").join(" ");
  let kind: FailureKind = "unknown";
  let failureStage = stage;
  if (/NotReadableError|NotFoundError|could not be read|cannot read|failed to read/i.test(text)) {
    kind = "file-read";
    failureStage = "read";
  } else if (message === "unsupported" || message === "video-type" || message === "video-size") {
    kind = message;
  } else if (/Failed to fetch|fetch failed|NetworkError|network request failed|Load failed|offline|connection|timeout|timed out|AbortError/i.test(text)) {
    kind = "connection";
  } else if (stage === "auth") {
    kind = "auth";
  } else if (stage === "upload" && ((status !== undefined && status >= 400) || /StorageApiError|access denied|unauthorized|forbidden|row.level security|invalidmime|entitytoolarge/i.test(text))) {
    kind = "storage";
  } else if (stage === "start") {
    kind = "start";
  }
  const error = new MessageAttachmentError(failureStage, kind, cause, safeDetail(rawCode), Number.isFinite(status) ? status : undefined);
  console.error("[message-attachment]", {
    stage: error.stage, kind: error.kind, code: error.code, status: error.status,
    name: safeDetail(name), message: safeDetail(message),
    details: safeDetail(errorField(cause, "details")),
  });
  return error;
}

/** No raw service/device messages are shown to the user. */
export function messageAttachmentErrorText(error: unknown, lang: "ar" | "en" = "ar"): string {
  const diagnosed = error instanceof MessageAttachmentError ? error : undefined;
  const kind = diagnosed?.kind ?? errorField(error, "message");
  const descriptions: Record<FailureKind, [string, string]> = {
    "file-read": ["تعذر قراءة الملف من الجهاز. تأكد من تنزيله على الجهاز ثم أعد اختياره.", "The file could not be read. Download it to this device, then select it again."],
    start: ["تعذر بدء رفع المرفق من الجهاز. أعد المحاولة.", "The attachment upload could not be started on this device. Try again."],
    connection: ["تعذر الاتصال أو انقطع أثناء العملية. تحقق من الإنترنت وأعد المحاولة.", "The connection failed or was interrupted. Check your internet connection and try again."],
    storage: ["رفض التخزين رفع المرفق. احتُفظ بتفاصيل الرفض في سجل التشخيص.", "Storage rejected the attachment upload. Rejection details were recorded in the diagnostic log."],
    auth: ["تعذر التحقق من جلسة الدخول قبل رفع المرفق. أعد المحاولة.", "Your session could not be verified before uploading. Try again."],
    unknown: ["تعذر إكمال عملية المرفق. احتُفظ بتفاصيل الخطأ في سجل التشخيص.", "The attachment operation failed. Error details were recorded in the diagnostic log."],
    unsupported: ["اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 10 ميجابايت.", "Choose a JPG, PNG or WebP image up to 10 MB."],
    "video-type": ["اختر فيديو MP4 أو MOV أو WebM بحجم لا يتجاوز 50 ميجابايت.", "Choose an MP4, MOV or WebM video up to 50 MB."],
    "video-size": ["اختر فيديو MP4 أو MOV أو WebM بحجم لا يتجاوز 50 ميجابايت.", "Choose an MP4, MOV or WebM video up to 50 MB."],
  };
  const stages: Record<FailureStage, [string, string]> = {
    validation: ["التحقق من الملف", "File validation"], read: ["قراءة/تجهيز الملف", "Reading/preparing the file"],
    auth: ["التحقق من جلسة الدخول", "Session verification"], start: ["بدء الرفع", "Starting the upload"],
    upload: ["رفع المرفق", "Uploading the attachment"], save: ["ربط المرفقات بالرسالة", "Saving attachments to the message"],
  };
  const index = lang === "en" ? 1 : 0;
  const description = typeof kind === "string" && Object.hasOwn(descriptions, kind) ? descriptions[kind as FailureKind][index] : descriptions.unknown[index];
  const prefix = diagnosed ? `${lang === "en" ? "Stage" : "المرحلة"}: ${stages[diagnosed.stage][index]}. ` : "";
  // HTTP status is safe and useful; arbitrary backend codes stay in the log.
  const suffix = diagnosed?.status ? ` (HTTP ${diagnosed.status})` : "";
  return prefix + description + suffix;
}

async function attachmentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("auth");
    return user;
  } catch (error) { throw diagnoseMessageAttachmentError(error, "auth"); }
}

async function uploadAttachment(path: string, body: Blob, contentType: string) {
  let request;
  try {
    request = supabase.storage.from("message-photos").upload(path, body, { contentType });
  } catch (error) { throw diagnoseMessageAttachmentError(error, "start"); }
  try {
    const { error } = await request;
    if (error) throw error;
  } catch (error) { throw diagnoseMessageAttachmentError(error, "upload"); }
}

/** يحوّل صور الجوال غير المدعومة (مثل HEIC من iPhone) أو الكبيرة إلى JPEG. */
export async function preparePhoto(file: File): Promise<Blob> {
  if (OK_TYPES.includes(file.type) && file.size <= MAX) return file;
  const looksImage = file.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name);
  if (!looksImage) throw new Error("unsupported");
  const bmp = await createImageBitmap(file).catch(error => {
    throw diagnoseMessageAttachmentError(error, "read");
  });
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
  const user = await attachmentUser();
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  let path: string;
  try { path = `${threadId}/${user.id}/${crypto.randomUUID()}.${ext}`; }
  catch (error) { throw diagnoseMessageAttachmentError(error, "start"); }
  await uploadAttachment(path, blob, blob.type || "image/jpeg");
  return path;
}

export type MediaKind = "image" | "video";

export function isVideoFile(f: File) {
  return f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.name);
}

/** يجهّز ويرفع صورة أو فيديو؛ يعيد المسار والنوع. يرمي "video-size" أو "video-type" أو "unsupported". */
export async function uploadMessageMedia(threadId: string, file: File): Promise<{ path: string; kind: MediaKind }> {
  let kind: MediaKind;
  try { kind = mediaType(file); }
  catch (error) { throw diagnoseMessageAttachmentError(error, "validation"); }
  if (kind === 'image') {
    let blob: Blob;
    try { blob = await preparePhoto(file); }
    catch (error) { throw diagnoseMessageAttachmentError(error, "read"); }
    return { path: await uploadMessagePhoto(threadId, blob), kind: "image" };
  }
  const video = videoFileInfo(file);
  if (!video) throw diagnoseMessageAttachmentError(new Error("video-type"), "validation");
  if (!file.size || file.size > VIDEO_MAX) throw diagnoseMessageAttachmentError(new Error("video-size"), "validation");
  const user = await attachmentUser();
  let path: string;
  try { path = `${threadId}/${user.id}/${crypto.randomUUID()}.${video.extension}`; }
  catch (error) { throw diagnoseMessageAttachmentError(error, "start"); }
  await uploadAttachment(path, file, video.contentType);
  return { path, kind: "video" };
}
