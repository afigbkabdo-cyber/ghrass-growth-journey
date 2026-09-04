import { createFileRoute } from "@tanstack/react-router";
import { Settings, School, Clock, Bell, ShieldCheck, Info } from "lucide-react";
import { SectionHeader, ToneBadge } from "@/components/ghiras";
import { adminPrivacyNote } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — لوحة إدارة غراس" },
      {
        name: "description",
        content: "إعدادات روضة غراس: بيانات الروضة، أوقات الدوام، الإشعارات، والخصوصية.",
      },
      { property: "og:title", content: "الإعدادات — لوحة إدارة غراس" },
      { property: "og:description", content: "بيانات الروضة وأوقات الدوام وإعدادات الإشعارات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettingsPage,
});

const nurseryInfo = [
  { label: "اسم الروضة", value: "روضة غراس" },
  { label: "الشعار", value: "نمو معًا" },
  { label: "المدينة", value: "الرياض — المملكة العربية السعودية" },
  { label: "رقم التواصل", value: "0500000000" },
  { label: "البريد الإلكتروني", value: "info@ghiras.sa" },
];

const shiftSettings = [
  { label: "بداية الدوام", value: "٧:٠٠ ص" },
  { label: "نهاية الدوام", value: "١٢:٣٠ م" },
  { label: "حد التأخير", value: "١٥ دقيقة" },
  { label: "أيام العمل", value: "الأحد — الخميس" },
];

const notificationSettings = [
  { label: "إشعار حضور الطفل لولي الأمر", enabled: true },
  { label: "إشعار الأنشطة اليومية", enabled: true },
  { label: "إشعار تأخر دوام المعلمة", enabled: true },
  { label: "تقرير أسبوعي لأولياء الأمور", enabled: false },
];

const rolePermissions = [
  { role: "ولي الأمر", tone: "orange" as const, items: ["متابعة طفله فقط", "قيمة الأسبوع والأنشطة", "التواصل مع المعلمة"] },
  { role: "المعلمة", tone: "blue" as const, items: ["حضور أطفال فصلها", "تسجيل دوامها", "إضافة الأنشطة والملاحظات"] },
  { role: "الإدارة", tone: "green" as const, items: ["إدارة الأطفال والكادر", "خطة القيم والإعلانات", "التقارير العامة"] },
];

function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <Settings className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">الإعدادات</h1>
          <p className="text-xs text-muted-foreground">إعدادات الروضة والدوام والصلاحيات</p>
        </div>
      </header>

      <section>
        <SectionHeader title="بيانات الروضة" icon={School} tone="green" />
        <div className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft">
          {nurseryInfo.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 p-4">
              <span className="text-xs font-bold text-muted-foreground">{row.label}</span>
              <span className="text-sm font-bold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="أوقات الدوام" subtitle="تُطبَّق على دوام المعلمات" icon={Clock} tone="blue" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shiftSettings.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="text-[11px] font-bold text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-sm font-extrabold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="الإشعارات" icon={Bell} tone="orange" />
        <div className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft">
          {notificationSettings.map((n) => (
            <div key={n.label} className="flex items-center justify-between gap-3 p-4">
              <span className="text-sm font-bold text-foreground">{n.label}</span>
              <ToneBadge tone={n.enabled ? "green" : "yellow"}>{n.enabled ? "مفعّل" : "متوقف"}</ToneBadge>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="الصلاحيات حسب الدور" icon={ShieldCheck} tone="pink" />
        <div className="grid gap-3 sm:grid-cols-3">
          {rolePermissions.map((r) => (
            <div key={r.role} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <ToneBadge tone={r.tone}>{r.role}</ToneBadge>
              <ul className="mt-2.5 space-y-1.5">
                {r.items.map((i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    • {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-3xl border border-brand-green-soft bg-brand-green-soft/40 p-4">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-green-deep" strokeWidth={2.2} />
        <p className="text-xs leading-relaxed text-foreground/80">{adminPrivacyNote}</p>
      </section>
    </div>
  );
}
