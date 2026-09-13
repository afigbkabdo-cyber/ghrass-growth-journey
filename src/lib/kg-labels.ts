/** مسميات المتابعة اليومية — مشتركة بين واجهة المعلمة وولي الأمر. */
export const mealStatusOptions = [
  { value: "all", label: "أكل الوجبة كاملة" },
  { value: "most", label: "أكل معظم الوجبة" },
  { value: "some", label: "أكل قليلًا" },
  { value: "none", label: "لم يأكل" },
] as const;

export const mealStatusLabels: Record<string, string> = Object.fromEntries(
  mealStatusOptions.map((o) => [o.value, o.label]),
);

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
