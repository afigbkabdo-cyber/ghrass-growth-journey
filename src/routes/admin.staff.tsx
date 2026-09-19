import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, UserPlus, ShieldCheck, KeyRound } from "lucide-react";
import { Avatar, ErrorState, LoadingCards, SectionHeader, ToneBadge } from "@/components/ghiras";
import { createAccount, resetAccountPassword } from "@/lib/admin.functions";
import { listParents, listStaff } from "@/lib/directory.functions";
import { displayPhone } from "@/lib/phone";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "الموظفون — لوحة إدارة غراس" },
      { name: "description", content: "إدارة الكادر التعليمي والإداري في روضة غراس وصلاحيات كل دور." },
      { property: "og:title", content: "الموظفون — لوحة إدارة غراس" },
      { property: "og:description", content: "الكادر التعليمي والإداري وصلاحياتهم." },
    ],
  }),
  component: AdminStaff,
});

const roleText: Record<string, string> = {
  teacher: "معلمة",
  admin: "إدارة",
  super_admin: "مسؤول النظام",
  parent: "ولي أمر",
};

function AdminStaff() {
  const { t, n } = useI18n();
  const qc = useQueryClient();
  const fetchStaff = useServerFn(listStaff);
  const fetchParents = useServerFn(listParents);
  const addAccount = useServerFn(createAccount);
  const resetPassword = useServerFn(resetAccountPassword);

  const [form, setForm] = useState({ fullName: "", phone: "", role: "teacher" as "teacher" | "parent", title: "" });
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const staffQuery = useQuery({ queryKey: ["admin-staff"], queryFn: () => fetchStaff({}) });
  const parentsQuery = useQuery({ queryKey: ["admin-parents"], queryFn: () => fetchParents({}) });

  const create = useMutation({
    mutationFn: () =>
      addAccount({
        data: {
          fullName: form.fullName,
          phone: form.phone,
          role: form.role,
          title: form.title || undefined,
        },
      }),
    onSuccess: (result) => {
      setError(null);
      setNotice(
        t("تم إنشاء الحساب — الجوال: {phone} · كلمة المرور المؤقتة: {password}", {
          phone: displayPhone(result.phone),
          password: result.password,
        }),
      );
      setForm({ fullName: "", phone: "", role: form.role, title: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      qc.invalidateQueries({ queryKey: ["admin-parents"] });
    },
    onError: (e: Error) => setError(t(e.message)),
  });

  const reset = useMutation({
    mutationFn: (userId: string) => resetPassword({ data: { userId } }),
    onSuccess: (result) => {
      setError(null);
      setNotice(t("كلمة مرور مؤقتة جديدة: {password}", { password: result.password }));
    },
    onError: (e: Error) => setError(t(e.message)),
  });

  const staff = staffQuery.data ?? [];
  const teachers = staff.filter((s) => s.role === "teacher");
  const managers = staff.filter((s) => s.role === "admin" || s.role === "super_admin");

  const personRow = (p: {
    id: string;
    name: string;
    phone: string | null;
    title: string | null;
    role: string;
    classes: string[];
  }) => (
    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
      <Avatar name={p.name} tone={p.role === "teacher" ? "blue" : p.role === "parent" ? "green" : "orange"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{n(p.name)}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {p.title ? n(p.title) : t(roleText[p.role] ?? p.role)} · {displayPhone(p.phone)}
          {p.classes.length ? ` — ${p.classes.map((c) => n(c)).join(t("، "))}` : ""}
        </p>
      </div>
      <ToneBadge tone={p.role === "teacher" ? "blue" : p.role === "parent" ? "green" : "orange"}>
        {t(roleText[p.role] ?? p.role)}
      </ToneBadge>
      <button
        onClick={() => reset.mutate(p.id)}
        aria-label={t("إعادة تعيين كلمة مرور {name}", { name: n(p.name) })}
        className="rounded-xl border border-border bg-muted p-2 text-muted-foreground"
      >
        <KeyRound className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {notice && (
        <p className="rounded-2xl bg-brand-green-soft px-3.5 py-3 text-[11px] font-bold leading-relaxed text-brand-green-deep">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-2xl bg-destructive/10 px-3.5 py-3 text-[11px] font-bold text-destructive">{error}</p>
      )}

      <SectionHeader
        title={t("الكادر التعليمي")}
        subtitle={t("{count} معلمات", { count: teachers.length })}
        icon={Users}
        tone="blue"
      />
      {staffQuery.isPending ? (
        <LoadingCards count={3} />
      ) : staffQuery.isError ? (
        <ErrorState onRetry={() => staffQuery.refetch()} />
      ) : (
        <div className="space-y-3">{teachers.map(personRow)}</div>
      )}

      <SectionHeader title={t("الإدارة")} subtitle={t("أعلى مستوى صلاحيات")} icon={ShieldCheck} tone="orange" />
      <div className="space-y-3">{managers.map(personRow)}</div>

      <SectionHeader
        title={t("أولياء الأمور")}
        subtitle={t("{count} حسابًا", { count: (parentsQuery.data ?? []).length })}
        icon={Users}
        tone="green"
      />
      <div className="space-y-3">{(parentsQuery.data ?? []).map(personRow)}</div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <p className="text-sm font-bold text-foreground">{t("الصلاحيات حسب الدور")}</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <li>• {t("الإدارة: اعتماد خطة القيم، إدارة الأطفال والكادر، الإعلانات والتقارير، والتواصل مع أولياء الأمور.")}</li>
          <li>• {t("المعلمة: الحضور، الأنشطة، والملاحظات.")}</li>
          <li>• {t("ولي الأمر: متابعة طفله فقط — بيانات الأطفال الآخرين محجوبة.")}</li>
        </ul>
      </div>

      {open ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNotice(null);
            setError(null);
            create.mutate();
          }}
          className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-soft"
        >
          <p className="text-sm font-bold text-foreground">{t("إنشاء حساب جديد")}</p>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder={t("الاسم الكامل")}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            required
            dir="ltr"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder={t("05XXXXXXXX")}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as "teacher" | "parent" })}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="teacher">{t("معلمة")}</option>
            <option value="parent">{t("ولي أمر")}</option>
          </select>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t("الوصف (اختياري) — مثال: معلمة اللغة العربية")}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {create.isPending ? t("جارٍ الإنشاء…") : t("إنشاء الحساب")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground"
            >
              {t("إلغاء")}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setNotice(null);
            setError(null);
            setOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95"
        >
          <UserPlus className="h-4.5 w-4.5" />
          {t("إضافة حساب (معلمة / ولي أمر)")}
        </button>
      )}
    </div>
  );
}
