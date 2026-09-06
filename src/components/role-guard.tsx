import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sprout, RefreshCw, ShieldAlert } from "lucide-react";
import { canAccess, roleHome, useAppSession, type Role } from "@/lib/session";

/**
 * حماية المسارات حسب الدور (جلسة حقيقية من قاعدة البيانات).
 * - بدون جلسة → صفحة الدخول.
 * - دور غير مسموح → الصفحة الرئيسية لدوره.
 * - خطأ في جلب الصلاحيات → رسالة واضحة وزر إعادة المحاولة (لا انتظار لا نهائي).
 */
export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const navigate = useNavigate();
  const { session, loading, error, reload } = useAppSession();

  const allowed = session ? canAccess(session.role, allow) : false;

  useEffect(() => {
    if (loading || error) return;
    if (!session) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (!allowed) navigate({ to: roleHome[session.role], replace: true });
  }, [loading, error, session, allowed, navigate]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-pink-soft">
            <ShieldAlert className="h-7 w-7 text-brand-pink-deep" strokeWidth={2.2} />
          </span>
          <p className="text-sm font-bold text-foreground">{error}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={reload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate({ to: "/login", replace: true })}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground"
            >
              صفحة الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !session || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-brand-green-soft">
            <Sprout className="h-7 w-7 text-brand-green-deep" strokeWidth={2.2} />
          </span>
          <p className="text-xs font-bold text-muted-foreground">جارٍ التحقق من الصلاحيات…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
