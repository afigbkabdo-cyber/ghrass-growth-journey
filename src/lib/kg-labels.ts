/** مسميات المتابعة اليومية — مشتركة بين واجهة المعلمة وولي الأمر. */
export const mealStatusOptions = [
  { value: "all", label: "تناول جيدًا" },
  { value: "some", label: "تناول جزءًا" },
  { value: "none", label: "لم يتناول" },
] as const;

export const mealStatusLabels: Record<string, string> = {
  ...Object.fromEntries(mealStatusOptions.map((o) => [o.value, o.label])),
  // سجلات قديمة
  most: "تناول جزءًا",
};

export const stageLabels: Record<string, string> = {
  nursery: "حضانة",
  kg1: "روضة أولى",
  kg2: "روضة ثانية",
  kg3: "تمهيدي",
};

/** حساب عمر الطفل بالسنوات والأشهر من تاريخ الميلاد. */
export function childAge(birthDate: string | null, lang: "ar" | "en" = "ar"): string | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (lang === "en") {
    if (years === 0) return `${rest} months`;
    if (rest === 0) return `${years} years`;
    return `${years} years ${rest} months`;
  }
  if (years === 0) return `${rest} شهرًا`;
  if (rest === 0) return `${years} سنوات`;
  return `${years} سنوات و${rest} أشهر`;
}

/** مدة نومة بالدقائق من وقتين HH:MM. */
export function sleepMinutes(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const [sh = NaN, sm = NaN] = start.slice(0, 5).split(":").map(Number);
  const [eh = NaN, em = NaN] = end.slice(0, 5).split(":").map(Number);
  if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return 0;
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

/** تنسيق مدة النوم (بالدقائق) كنص مقروء. */
export function sleepDurationLabel(
  minutes: number,
  t: (k: string, p?: Record<string, string | number>) => string,
  num?: (v: number) => string,
): string {
  const f = (v: number) => (num ? num(v) : String(v));
  if (!minutes || minutes <= 0) return t("لا يوجد");
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return t("{value} دقيقة", { value: f(m) });
  if (m === 0) return t("{value} ساعة", { value: f(h) });
  return t("{h} ساعة و{m} دقيقة", { h: f(h), m: f(m) });
}
