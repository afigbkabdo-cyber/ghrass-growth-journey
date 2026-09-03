import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, Mail, Lock } from "lucide-react";
import { GhirasLogo, ToneBadge } from "@/components/ghiras";
import {
  demoAccounts,
  findAccount,
  roleLabels,
  roleHome,
  writeSession,
  type Role,
} from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "الدخول إلى غراس — نمو معًا" },
      {
        name: "description",
        content: "دخول أولياء الأمور والمعلمات وإدارة روضة غراس إلى واجهتهم الخاصة.",
      },
      { property: "og:title", content: "الدخول إلى غراس — نمو معًا" },
      { property: "og:description", content: "واجهة دخول موحّدة تُحدَّد حسب دور المستخدم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const roles: Role[] = ["parent", "teacher", "admin"];

function accountFor(role: Role) {
  return demoAccounts.find((a) => a.role === role)!;
}

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("teacher");
  const [email, setEmail] = useState(accountFor("teacher").email);
  const [password, setPassword] = useState("ghiras123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = findAccount(email);
    if (!account || account.password !== password) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      return;
    }
    setError(null);
    setLoading(true);
    writeSession({
      role: account.role,
      name: account.name,
      email: account.email,
      accountId: account.id,
    });
    setTimeout(() => navigate({ to: roleHome[account.role], replace: true }), 350);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <GhirasLogo size="lg" />
          <h1 className="font-display text-xl font-extrabold text-foreground">أهلًا بك في غراس</h1>
          <p className="text-xs text-muted-foreground">نمو معًا — روضة غراس، المملكة العربية السعودية</p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft"
        >
          <div>
            <p className="mb-2 text-xs font-bold text-foreground">اختر نوع الحساب</p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setEmail(accountFor(r).email);
                    setPassword("ghiras123");
                    setError(null);
                  }}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors ${
                    role === r
                      ? "border-primary bg-brand-orange-soft text-brand-orange-deep"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{accountFor(role).title}</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-foreground">البريد الإلكتروني</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="w-full rounded-2xl border border-border bg-background py-3 ps-10 pe-4 text-sm outline-none transition-shadow focus:shadow-soft"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-foreground">كلمة المرور</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="w-full rounded-2xl border border-border bg-background py-3 ps-10 pe-4 text-sm outline-none transition-shadow focus:shadow-soft"
              />
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[11px] font-bold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition-opacity disabled:opacity-60"
          >
            <LogIn className="h-4.5 w-4.5" />
            {loading ? "جارٍ الدخول…" : "دخول"}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            نموذج عرض تجريبي — كلمة المرور لجميع الحسابات: ghiras123
          </p>
        </form>

        <div className="mt-4 flex justify-center">
          <ToneBadge tone="green">بياناتك ومحتوى طفلك محمي داخل غراس</ToneBadge>
        </div>
      </div>
    </main>
  );
}
