/*
 * جلسة تجريبية بسيطة (بدون خادم) — تُهيّئ البنية لربط Authentication موحّد لاحقًا
 * حيث تُحدَّد الواجهة حسب الدور: parent | teacher | admin.
 */

export type Role = "parent" | "teacher" | "admin";

export const roleLabels: Record<Role, string> = {
  parent: "ولي أمر",
  teacher: "معلمة",
  admin: "الإدارة",
};

export interface DemoSession {
  role: Role;
  name: string;
  email: string;
}

const STORAGE_KEY = "ghiras.demo-session";

export function readSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: DemoSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** المسار الرئيسي لكل دور — نقطة الربط المستقبلية مع نظام الصلاحيات الحقيقي. */
export const roleHome: Record<Role, string> = {
  parent: "/",
  teacher: "/teacher",
  admin: "/admin",
};

/** الأدوار المسموح لها بفتح كل قسم من التطبيق. */
export const sectionRoles = {
  parent: ["parent"] as Role[],
  teacher: ["teacher"] as Role[],
  admin: ["admin"] as Role[],
};

export function canAccess(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}
