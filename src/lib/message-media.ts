export const MAX_FILES = 10;
export const IMAGE_MAX = 10 * 1024 * 1024;
export const VIDEO_MAX = 50 * 1024 * 1024;

type VideoInfo = { contentType: 'video/mp4' | 'video/quicktime' | 'video/webm'; extension: 'mp4' | 'mov' | 'webm' };
export function videoFileInfo(file: { type: string; name: string }): VideoInfo | null {
  if (/\.(mp4|m4v)$/i.test(file.name)) return { contentType: 'video/mp4', extension: 'mp4' };
  if (/\.mov$/i.test(file.name)) return { contentType: 'video/quicktime', extension: 'mov' };
  if (/\.webm$/i.test(file.name)) return { contentType: 'video/webm', extension: 'webm' };
  const mime = file.type.toLowerCase().split(';', 1)[0]?.trim() ?? '';
  if (mime === 'video/mp4' || mime === 'video/x-m4v' || mime === 'application/mp4') return { contentType: 'video/mp4', extension: 'mp4' };
  if (mime === 'video/quicktime' || mime === 'video/mov' || mime === 'video/x-quicktime') return { contentType: 'video/quicktime', extension: 'mov' };
  if (mime === 'video/webm' || mime === 'video/x-webm') return { contentType: 'video/webm', extension: 'webm' };
  return null;
}

export function mediaType(file: { type: string; name: string; size: number }) {
  const type = file.type.toLowerCase().split(';', 1)[0]?.trim() ?? '';
  if (videoFileInfo(file)) {
    if (!file.size || file.size > VIDEO_MAX) throw new Error('video-size');
    return 'video' as const;
  }
  if (type.startsWith('video/')) throw new Error('video-type');
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(type) && !/\.(heic|heif|jpe?g|png|webp)$/i.test(file.name)) throw new Error('unsupported');
  if (!file.size || file.size > IMAGE_MAX) throw new Error('unsupported');
  return 'image' as const;
}
export function attachmentNotice(message: { body: string; photo_path: string | null; attachments: unknown }) {
  const items = Array.isArray(message.attachments) ? message.attachments : [];
  const count = items.length + (message.photo_path && !items.some(item => item?.path === message.photo_path) ? 1 : 0);
  const label = count > 1 ? ['عدة مرفقات من الإدارة', 'Multiple attachments from administration'] : items[0]?.kind === 'video' ? ['فيديو مرفق من الإدارة', 'Video attached by administration'] : count ? ['صورة مرفقة من الإدارة', 'Photo attached by administration'] : null;
  if (!label) return null;
  const text = message.body.trim().slice(0, 300);
  return { body: text ? `${text}\n${label[0]}` : label[0], body_en: text ? `${text}\n${label[1]}` : label[1] };
}