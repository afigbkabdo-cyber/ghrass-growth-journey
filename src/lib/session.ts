/*
 * جلسة المستخدم الحقيقية (Lovable Cloud) — الدور يُقرأ من قاعدة البيانات.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "parent" | "teacher" | "admin" | "super_admin";

export const roleLabels: Record<Role, string> = {
  parent: "ولي أمر",
  teacher: "معلمة",
  admin: "الإدارة",
  super_admin: "مسؤول النظام",
};

export interface AppSession {
  userId: string;
  role: Role;
  name: string;
  phone: string | null;
  title: string | null;
  mustChangePassword: boolean;
}

/** المسار الرئيسي لكل دور. */
export const roleHome: Record<Role, string> = {
  parent: "/",
  teacher: "/teacher",
  admin: "/admin",
  super_admin: "/admin",
};

/** الأدوار المسموح لها بفتح كل قسم — مسؤول النظام يملك صلاحيات كاملة. */
export const sectionRoles = {
  parent: ["parent", "super_admin"] as Role[],
  teacher: ["teacher", "super_admin"] as Role[],
  admin: ["admin", "super_admin"] as Role[],
};

export function canAccess(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

const rolePriority: Role[] = ["super_admin", "admin", "teacher", "parent"];

/** مفاتيح محلية قديمة/تجريبية تُمسح عند الخروج. */
const LOCAL_KEYS = [
  "ghiras.demo-session",
  "ghiras.role",
  "ghiras.auth",
  "ghiras.demo-role",
  "ghiras.teacher.shift",
];

export function clearLocalState() {
  if (typeof window === "undefined") return;
  for (const key of LOCAL_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

/** إنهاء الجلسة فعليًا. */
export async function signOutCompletely() {
  try {
    await supabase.auth.signOut();
  } catch {
    /* تجاهل — سنمسح الحالة المحلية على أي حال */
  }
  clearLocalState();
}

/** توافقًا مع الاستدعاءات الحالية. */
export const clearSession = signOutCompletely;

/** قراءة الجلسة والدور من قاعدة البيانات. */
export async function loadSession(): Promise<AppSession | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  const user = userData.user;

  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, phone, title, must_change_password").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);

  if (profileError) throw profileError;
  if (rolesError) throw rolesError;

  const owned = (roles ?? []).map((r) => r.role as Role);
  const role = rolePriority.find((r) => owned.includes(r)) ?? "parent";

  return {
    userId: user.id,
    role,
    name: profile?.full_name ?? "",
    phone: profile?.phone ?? null,
    title: profile?.title ?? null,
    mustChangePassword: profile?.must_change_password ?? false,
  };
}

export interface SessionState {
  session: AppSession | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** هوك الجلسة — لا يبقى عالقًا في التحميل: أي خطأ يظهر مع إمكانية إعادة المحاولة. */
export function useAppSession(): SessionState {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        setError("تعذر التحقق من الصلاحيات — تحقق من الاتصال بالإنترنت.");
      }
    }, 12000);

    loadSession()
      .then((result) => {
        if (cancelled) return;
        setSession(result);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("تعذر التحقق من الصلاحيات. حاول مرة أخرى.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [tick]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") reload();
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);

  return { session, loading, error, reload };
}
