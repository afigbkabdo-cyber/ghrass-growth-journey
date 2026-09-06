/*
 * توحيد أرقام الجوال السعودية: 05XXXXXXXX أو 5XXXXXXXX أو +9665XXXXXXXX
 * تُخزَّن دائمًا بالشكل 9665XXXXXXXX.
 */

export function normalizePhone(raw: string): string | null {
  const digits = (raw ?? "")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\D/g, "");
  if (!digits) return null;

  let local = digits;
  if (local.startsWith("00966")) local = local.slice(5);
  else if (local.startsWith("966")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);

  if (!/^5\d{8}$/.test(local)) return null;
  return `966${local}`;
}

/** صيغة العرض: 05XXXXXXXX */
export function displayPhone(stored: string | null | undefined): string {
  if (!stored) return "—";
  const local = stored.startsWith("966") ? stored.slice(3) : stored;
  return local.startsWith("5") ? `0${local}` : local;
}

/** بريد داخلي مشتق من رقم الجوال — يُستخدم للمصادقة فقط ولا يُعرض للمستخدم. */
export function phoneToEmail(normalized: string): string {
  return `${normalized}@ghiras.app`;
}
