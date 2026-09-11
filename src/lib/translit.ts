/*
 * تحويل صوتي (transliteration) للأسماء العربية إلى حروف لاتينية.
 * يُستخدم فقط عند عدم وجود اسم إنجليزي محفوظ — لا يغيّر البيانات المخزنة أبدًا.
 */

const LETTERS: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "aa", ٱ: "a", ء: "", ؤ: "u", ئ: "i",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "th",
  ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", و: "w", ي: "y", ى: "a", ة: "ah", ﻻ: "la", ﻷ: "la",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

/** إزالة التشكيل والتطويل. */
const DIACRITICS = /[\u064B-\u065F\u0670\u0640]/g;

function transliterateWord(word: string): string {
  let out = "";
  const chars = [...word];
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i]!;
    // "ال" التعريف في بداية الكلمة
    if (i === 0 && ch === "ا" && chars[1] === "ل") {
      out += "Al";
      i += 1;
      continue;
    }
    if (ch === "و" && i === 0) {
      out += "w";
      continue;
    }
    out += LETTERS[ch] ?? (/[\u0600-\u06FF]/.test(ch) ? "" : ch);
  }
  out = out.replace(/([a-z])\1{2,}/gi, "$1$1");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** تحويل صوتي لاسم كامل: «أحمد محمد» → «Ahmad Mhmd». */
export function transliterate(text: string): string {
  if (!text) return text;
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  return text
    .replace(DIACRITICS, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(transliterateWord)
    .filter(Boolean)
    .join(" ");
}
