import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, Mail, Lock, Phone } from "lucide-react";
import { GhirasLogoFull, ToneBadge } from "@/components/ghiras";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone, phoneToEmail } from "@/lib/phone";
import { loadSession, roleHome } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "الدخول إلى غراس — ننمو معًا" },
      {
        name: "description",
        content: "دخول أولياء الأمور والمعلمات وإدارة روضة غراس إلى واجهتهم الخاصة.",
      },
      { property: "og:title", content: "الدخول إلى غراس — ننمو معًا" },
      { property: "og:description", content: "واجهة دخول موحّدة تُحدَّد حسب دور المستخدم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let authEmail = email.trim();
    if (method === "phone") {
      const normalized = normalizePhone(phone);
      if (!normalized) {
        setError(t("رقم الجوال غير صحيح. استخدم الصيغة 05XXXXXXXX."));
        return;
      }
      authEmail = phoneToEmail(normalized);
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });
    if (signInError) {
      setLoading(false);
      setError(t("بيانات الدخول غير صحيحة. تأكد من الرقم وكلمة المرور."));
      return;
    }

    try {
      const session = await loadSession();
      const to = session ? roleHome[session.role] : "/";
      navigate({ to, replace: true });
    } catch {
      navigate({ to: "/", replace: true });
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors ${
      active
        ? "border-primary bg-brand-orange-soft text-brand-orange-deep"
        : "border-border bg-card text-muted-foreground hover:bg-muted"
    }`;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <GhirasLogoFull className="w-44" />
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft"
        >
          <div>
            <p className="mb-2 text-xs font-bold text-foreground">{t("طريقة تسجيل الدخول")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod("phone");
                  setError(null);
                }}
                className={tabClass(method === "phone")}
              >
                <Phone className="h-4 w-4" />
                {t("رقم الجوال")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setError(null);
                }}
                className={tabClass(method === "email")}
              >
                <Mail className="h-4 w-4" />
                {t("البريد الإلكتروني")}
              </button>
            </div>
          </div>

          {method === "phone" ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-foreground">{t("رقم الجوال")}</span>
              <span className="relative block">
                <Phone className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  className="w-full rounded-2xl border border-border bg-background py-3 ps-10 pe-4 text-sm outline-none transition-shadow focus:shadow-soft"
                />
              </span>
            </label>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-foreground">{t("البريد الإلكتروني")}</span>
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
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-foreground">{t("كلمة المرور")}</span>
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
            {loading ? t("جارٍ الدخول…") : t("دخول")}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            {t("الحسابات تُنشأ من قِبل إدارة الروضة. إذا نسيت كلمة المرور تواصل مع الإدارة.")}
          </p>
        </form>

        <div className="mt-4 flex justify-center">
          <ToneBadge tone="green">{t("بياناتك ومحتوى طفلك محمي داخل غراس")}</ToneBadge>
        </div>
      </div>
    </main>
  );
}
