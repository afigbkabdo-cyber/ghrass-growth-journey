import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CircleHelp, Languages, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, parentNav } from "@/components/shells";
import { LanguageSwitcher } from "@/lib/i18n";
import { Avatar, PageContainer, SectionHeader, ToneBadge } from "@/components/ghiras";
import { Switch } from "@/components/ui/switch";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles, signOutCompletely, useAppSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "المزيد والإعدادات — غراس" },
      { name: "description", content: "الملف الشخصي وإعدادات الحساب وتسجيل الخروج في تطبيق غراس." },
      { property: "og:title", content: "المزيد والإعدادات — غراس" },
      { property: "og:description", content: "الملف الشخصي وإعدادات الحساب في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <MorePage />
    </RoleGuard>
  ),
});

function MorePage() {
  const navigate = useNavigate();
  const { session } = useAppSession();
  const [notifications, setNotifications] = useState(true);
  const { t } = useI18n();

  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        <div className="mb-4"><LanguageSwitcher /></div>
        <section className="mb-6 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <Avatar name={session?.name ?? t("ولي الأمر")} tone="orange" size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-extrabold text-foreground">{session?.name ?? t("ولي الأمر")}</h1>
            <p className="text-xs text-muted-foreground">{session?.phone ?? t("حساب ولي أمر")}</p>
          </div>
          <ToneBadge tone="green">{t("حساب موثق")}</ToneBadge>
        </section>

        <SectionHeader title={t("الخصوصية")} subtitle={t("بيانات طفلك محفوظة ومحمية")} icon={ShieldCheck} tone="green" />
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("الموافقات (مثل نشر صور الأنشطة) تُعطى مرة واحدة عند تسجيل الطفل في الروضة، وتُدار من إدارة الروضة.\n            لتعديل أي موافقة تواصل مع الإدارة من صفحة الرسائل.")}
          </p>
        </div>

        <SectionHeader title={t("إعدادات التطبيق")} icon={Bell} tone="blue" />
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue-soft">
                <Bell className="h-4.5 w-4.5 text-brand-blue-deep" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{t("الإشعارات الفورية")}</p>
                <p className="text-[11px] text-muted-foreground">{t("أنشطة ورسائل وحضور طفلك")}</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} aria-label={t("الإشعارات")} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-green-soft">
                <Languages className="h-4.5 w-4.5 text-brand-green-deep" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{t("لغة التطبيق")}</p>
                <p className="text-[11px] text-muted-foreground">{t("العربية (الافتراضية)")}</p>
              </div>
            </div>
            <ToneBadge tone="green">{t("العربية")}</ToneBadge>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => toast.info(t("للمساعدة تواصل مع إدارة الروضة من صفحة الرسائل."))}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start shadow-soft transition-shadow hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-yellow-soft">
              <CircleHelp className="h-4.5 w-4.5 text-brand-yellow-deep" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold text-foreground">{t("المساعدة والدعم")}</span>
          </button>
          <button
            onClick={async () => {
              await signOutCompletely();
              navigate({ to: "/login", replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-start transition-colors hover:bg-destructive/10"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10">
              <LogOut className="h-4.5 w-4.5 text-destructive" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold text-destructive">{t("تسجيل الخروج")}</span>
          </button>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            <span className="text-brand-orange-deep">{t("غراس")}</span> — {t("ننمو معًا")}
          </p>
        </div>
      </PageContainer>
    </AppShell>
  );
}
