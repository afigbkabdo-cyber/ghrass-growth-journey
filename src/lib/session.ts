/*
 * جلسة تجريبية بسيطة (بدون خادم) — تُهيّئ البنية لربط Authentication موحّد لاحقًا
 * حيث تُحدَّد الواجهة حسب الدور: parent | teacher | admin | owner.
 */

export type Role = "parent" | "teacher" | "admin" | "owner";

export const roleLabels: Record<Role, string> = {
  parent: "ولي أمر",
  teacher: "معلمة",
  admin: "الإدارة",
  owner: "المالك",
};

export interface DemoSession {
  role: Role;
  name: string;
  email: string;
  /** معرّف الحساب — يفصل بين المالك الأول والثاني */
  accountId: string;
}

/** حسابات تجريبية — كل مالك حساب مستقل بجلسة مستقلة */
export interface DemoAccount {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  title: string;
}

export const demoAccounts: DemoAccount[] = [
  { id: "parent_1", role: "parent", name: "أم ليان", email: "parent@ghiras.sa", password: "ghiras123", title: "ولي أمر — ليان" },
  { id: "teacher_1", role: "teacher", name: "أ. نورة العتيبي", email: "noura@ghiras.sa", password: "ghiras123", title: "معلمة اللغة العربية" },
  { id: "admin_1", role: "admin", name: "أ. الجوهرة السبيعي", email: "admin@ghiras.sa", password: "ghiras123", title: "مديرة الروضة" },
  { id: "owner_1", role: "owner", name: "المالك الأول — أ. عبدالله", email: "owner1@ghiras.sa", password: "ghiras123", title: "مالك الروضة (١)" },
  { id: "owner_2", role: "owner", name: "المالك الثاني — أ. لمياء", email: "owner2@ghiras.sa", password: "ghiras123", title: "مالك الروضة (٢)" },
];

export function findAccount(email: string) {
  return demoAccounts.find((a) => a.email.trim().toLowerCase() === email.trim().toLowerCase());
}

const STORAGE_KEY = "ghiras.demo-session";

/** كل مفاتيح المصادقة التجريبية — تُمسح كلها عند تسجيل الخروج */
const AUTH_KEYS = [STORAGE_KEY, "ghiras.role", "ghiras.auth", "ghiras.demo-role", "ghiras.teacher.shift"];

export function readSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (!parsed?.role || !roleLabels[parsed.role as Role]) return null;
    return {
      role: parsed.role as Role,
      name: parsed.name ?? "",
      email: parsed.email ?? "",
      accountId: parsed.accountId ?? "",
    };
  } catch {
    return null;
  }
}

export function writeSession(session: DemoSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** مسح الجلسة والدور وأي بيانات مصادقة تجريبية محفوظة. */
export function clearSession() {
  if (typeof window === "undefined") return;
  for (const key of AUTH_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

/** المسار الرئيسي لكل دور — نقطة الربط المستقبلية مع نظام الصلاحيات الحقيقي. */
export const roleHome: Record<Role, string> = {
  parent: "/parent",
  teacher: "/teacher",
  admin: "/admin",
  owner: "/owner",
};

/** الأدوار المسموح لها بفتح كل قسم من التطبيق. */
export const sectionRoles = {
  parent: ["parent"] as Role[],
  teacher: ["teacher"] as Role[],
  admin: ["admin"] as Role[],
  owner: ["owner"] as Role[],
};

export function canAccess(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}
