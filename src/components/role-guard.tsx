import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { canAccess, readSession, roleHome, type Role } from "@/lib/session";

/**
 * حماية المسارات حسب الدور (جلسة تجريبية على المتصفح).
 * - بدون جلسة → صفحة الدخول.
 * - دور غير مسموح → الصفحة الرئيسية لدوره.
 */
export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (!session) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (!canAccess(session.role, allow)) {
      navigate({ to: roleHome[session.role], replace: true });
      return;
    }
    setReady(true);
  }, [allow, navigate]);

  if (!ready) {
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
