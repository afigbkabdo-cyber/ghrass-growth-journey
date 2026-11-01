import { describe, expect, it } from 'vitest';
import { attachmentNotice, mediaType, MAX_FILES, IMAGE_MAX, VIDEO_MAX } from '../message-media';

describe('existing chat attachment limits', () => {
  it('allows at most ten files per message', () => expect(MAX_FILES).toBe(10));
  it('enforces the existing 10 MiB image limit', () => {
    expect(IMAGE_MAX).toBe(10485760);
    expect(mediaType({ name: 'child.png', type: 'image/png', size: 10485760 })).toBe('image');
    expect(() => mediaType({ name: 'child.png', type: 'image/png', size: 10485761 })).toThrow('unsupported');
  });
  it('enforces the existing 50 MiB video limit', () => {
    expect(VIDEO_MAX).toBe(52428800);
    expect(mediaType({ name: 'child.mp4', type: 'video/mp4', size: 52428800 })).toBe('video');
    expect(() => mediaType({ name: 'child.mp4', type: 'video/mp4', size: 52428801 })).toThrow('video-size');
  });
  it('rejects unsupported files', () => expect(() => mediaType({ name: 'data.pdf', type: 'application/pdf', size: 100 })).toThrow('unsupported'));
  it('distinguishes one photo, video and multiple attachments', () => {
    const base = { body: '', photo_path: null };
    expect(attachmentNotice({ ...base, attachments: [{ path: 'a', kind: 'image' }] })?.body).toBe('صورة مرفقة من الإدارة');
    expect(attachmentNotice({ ...base, attachments: [{ path: 'a', kind: 'video' }] })?.body).toBe('فيديو مرفق من الإدارة');
    expect(attachmentNotice({ ...base, attachments: [{ path: 'a', kind: 'image' }, { path: 'b', kind: 'video' }] })?.body).toBe('عدة مرفقات من الإدارة');
  });
  it('preserves legacy photos without double counting', () => expect(attachmentNotice({ body: '', photo_path: 'a', attachments: [{ path: 'a', kind: 'image' }] })?.body_en).toBe('Photo attached by administration'));
});