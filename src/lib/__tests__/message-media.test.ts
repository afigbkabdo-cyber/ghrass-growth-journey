import { describe, expect, it } from 'vitest';
import { attachmentNotice, mediaType, videoFileInfo, MAX_FILES, IMAGE_MAX, VIDEO_MAX } from '../message-media';

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
  it.each([
    ['child.mp4', 'video/mp4', 'video/mp4', 'mp4'],
    ['iphone.MOV', 'video/quicktime', 'video/quicktime', 'mov'],
    ['child.webm', 'video/webm', 'video/webm', 'webm'],
  ])('accepts %s and supplies its canonical upload type', (name, type, contentType, extension) => {
    const file = { name, type, size: 1024 };
    expect(mediaType(file)).toBe('video');
    expect(videoFileInfo(file)).toEqual({ contentType, extension });
  });
  it.each([
    ['iphone.MOV', ''],
    ['android.mp4', ''],
    ['browser.webm', ''],
    ['iphone.MOV', 'application/octet-stream'],
    ['android.mp4', 'application/octet-stream'],
    ['android.mp4', 'video/mpeg'],
    ['browser.webm', 'application/octet-stream'],
  ])('accepts %s when the device reports MIME %s', (name, type) => {
    expect(mediaType({ name, type, size: 1024 })).toBe('video');
  });
  it('accepts a recognised video MIME when the filename has no extension', () => {
    expect(mediaType({ name: 'video', type: 'video/quicktime', size: 1024 })).toBe('video');
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