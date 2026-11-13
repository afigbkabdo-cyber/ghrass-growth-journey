/** توليد كلمة مرور مؤقتة عشوائية قوية باستخدام مولد تشفيري آمن (crypto). */
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "@#%+=!?";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function randomIndex(max: number): number {
  // Rejection sampling to avoid modulo bias.
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return buf[0]! % max;
  }
}

const pick = (s: string) => s[randomIndex(s.length)]!;

export function generateTempPassword(length = 14): string {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
  while (chars.length < length) chars.push(pick(ALL));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}
