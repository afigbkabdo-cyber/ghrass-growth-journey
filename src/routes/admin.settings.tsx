import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Settings, School, Clock, Bell, ShieldCheck, Info, Pencil, Languages } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ToneBadge } from "@/components/ghiras";
import { adminPrivacyNote } from "@/lib/admin-data";
import { getNurserySettings, saveNurserySettings, type NurseryInfo } from "@/lib/settings.functions";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — لوحة إدارة غراس" },
      {
        name: "description",
        content: "إعدادات روضة غراس: بيانات الروضة، اللغة، أوقات الدوام، الإشعارات، والخصوصية.",
      },
      { property: "og:title", content: "الإعدادات — لوحة إدارة غراس" },
      { property: "og:description", content: "بيانات الروضة واللغة وأوقات الدوام وإعدادات الإشعارات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettingsPage,
});

const field = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

const notificationSettings = [
  { label: "إشعار حضور الطفل لولي الأمر", enabled: true },
  { label: "إشعار الأنشطة اليومية", enabled: true },
  { label: "إشعار تأخر دوام المعلمة", enabled: true },
  { label: "تقرير أسبوعي لأولياء الأمور", enabled: false },
];

const rolePermissions = [
  {
    role: "ولي الأمر",
    tone: "orange" as const,
    items: ["متابعة طفله فقط", "قيمة الأسبوع والأنشطة", "التواصل مع الإدارة"],
  },
  {
    role: "المعلمة",
    tone: "blue" as const,
    items: ["حضور أطفال فصلها", "تسجيل دوامها", "إضافة الأنشطة والملاحظات"],
  },
  {
    role: "الإدارة",
    tone: "green" as const,
    items: ["إدارة الأطفال والكادر والفصول", "خطة القيم والإعلانات", "بيانات الروضة والتقارير"],
  },
];

function AdminSettingsPage() {
  const { t: tr, time, num } = useI18n();
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getNurserySettings);
  const saveSettings = useServerFn(saveNurserySettings);

  const settings = useQuery({ queryKey: ["nursery-settings"], queryFn: () => fetchSettings({}) });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<NurseryInfo | null>(null);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: (data: NurseryInfo) =>
      saveSettings({
        data: {
          id: data.id,
          name: data.name,
          tagline: data.tagline,
          city: data.city,
          phone: data.phone,
          email: data.email,
          instagram: data.instagram,
          nameEn: data.nameEn || "",
          taglineEn: data.taglineEn || "",
          cityEn: data.cityEn || "",
          dayStart: data.dayStart || "",
          dayEnd: data.dayEnd || "",
        },
      }),
    onSuccess: () => {
      toast.success(tr("تم الحفظ"));
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["nursery-settings"] });
    },
    onError: (e: Error) => toast.error(e.message || tr("تعذر الحفظ")),
  });

  const rows: { label: string; key: keyof NurseryInfo }[] = [
    { label: tr("اسم الروضة"), key: "name" },
    { label: tr("الشعار"), key: "tagline" },
    { label: tr("المدينة"), key: "city" },
    { label: tr("رقم التواصل"), key: "phone" },
    { label: tr("البريد الإلكتروني"), key: "email" },
    { label: tr("إنستقرام"), key: "instagram" },
  ];

  const enRows: { label: string; key: keyof NurseryInfo }[] = [
    { label: tr("اسم الروضة (إنجليزي)"), key: "nameEn" },
    { label: tr("الشعار (إنجليزي)"), key: "taglineEn" },
    { label: tr("المدينة (إنجليزي)"), key: "cityEn" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <Settings className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{tr("الإعدادات")}</h1>
          <p className="text-xs text-muted-foreground">{tr("بيانات الروضة واللغة والدوام والصلاحيات")}</p>
        </div>
      </header>

      <section>
        <SectionHeader title={tr("اللغة")} icon={Languages} tone="blue" />
        <LanguageSwitcher />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <SectionHeader title={tr("بيانات الروضة")} icon={School} tone="green" />
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            aria-label={tr("تعديل بيانات الروضة")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border text-muted-foreground hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {settings.isLoading || !form ? (
          <p className="text-sm text-muted-foreground">{tr("جارٍ التحميل…")}</p>
        ) : editing ? (
          <div className="space-y-2.5 rounded-3xl border border-brand-green-soft bg-card p-4 shadow-soft">
            {rows.map((r) => (
              <label key={r.key} className="block text-[11px] font-bold text-muted-foreground">
                {r.label}
                <input
                  value={form[r.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [r.key]: e.target.value })}
                  className={field}
                />
              </label>
            ))}
            {enRows.map((r) => (
              <label key={r.key} className="block text-[11px] font-bold text-muted-foreground">
                {r.label}
                <input
                  value={form[r.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [r.key]: e.target.value })}
                  className={field}
                  dir="ltr"
                />
              </label>
            ))}
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] font-bold text-muted-foreground">
                {tr("بداية الدوام")}
                <input
                  type="time"
                  value={form.dayStart ?? ""}
                  onChange={(e) => setForm({ ...form, dayStart: e.target.value })}
                  className={field}
                />
              </label>
              <label className="block text-[11px] font-bold text-muted-foreground">
                {tr("نهاية الدوام")}
                <input
                  type="time"
                  value={form.dayEnd ?? ""}
                  onChange={(e) => setForm({ ...form, dayEnd: e.target.value })}
                  className={field}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={save.isPending}
                onClick={() => save.mutate(form)}
                className="flex-1 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
              >
                {save.isPending ? tr("جارٍ الحفظ…") : tr("حفظ")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(settings.data ?? null);
                  setEditing(false);
                }}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-bold text-muted-foreground"
              >
                {tr("إلغاء")}
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 p-4">
                <span className="text-xs font-bold text-muted-foreground">{r.label}</span>
                <span className="text-sm font-bold text-foreground">{form[r.key] || tr("غير محدد")}</span>
              </div>
            ))}
            {enRows.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 p-4">
                <span className="text-xs font-bold text-muted-foreground">{r.label}</span>
                <span className="text-sm font-bold text-foreground" dir="ltr">
                  {form[r.key] || tr("غير محدد")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title={tr("أوقات الدوام")} subtitle={tr("تُطبَّق على دوام المعلمات")} icon={Clock} tone="blue" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: tr("بداية الدوام"), value: form?.dayStart ? time(form.dayStart) : tr("غير محدد") },
            { label: tr("نهاية الدوام"), value: form?.dayEnd ? time(form.dayEnd) : tr("غير محدد") },
            { label: tr("حد التأخير"), value: `${num(15)} ${tr("دقيقة")}` },
            { label: tr("أيام العمل"), value: tr("الأحد — الخميس") },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="text-[11px] font-bold text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-sm font-extrabold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title={tr("الإشعارات")} icon={Bell} tone="orange" />
        <div className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft">
          {notificationSettings.map((n) => (
            <div key={n.label} className="flex items-center justify-between gap-3 p-4">
              <span className="text-sm font-bold text-foreground">{tr(n.label)}</span>
              <ToneBadge tone={n.enabled ? "green" : "yellow"}>{n.enabled ? tr("مفعّل") : tr("متوقف")}</ToneBadge>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title={tr("الصلاحيات حسب الدور")} icon={ShieldCheck} tone="pink" />
        <div className="grid gap-3 sm:grid-cols-3">
          {rolePermissions.map((r) => (
            <div key={r.role} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <ToneBadge tone={r.tone}>{tr(r.role)}</ToneBadge>
              <ul className="mt-2.5 space-y-1.5">
                {r.items.map((i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    • {tr(i)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-3xl border border-brand-green-soft bg-brand-green-soft/40 p-4">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-green-deep" strokeWidth={2.2} />
        <p className="text-xs leading-relaxed text-foreground/80">{tr(adminPrivacyNote)}</p>
      </section>
    </div>
  );
}
