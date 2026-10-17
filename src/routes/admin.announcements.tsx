import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Megaphone, Pencil, Plus, Send, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [
      { title: "الإعلانات — لوحة إدارة غراس" },
      {
        name: "description",
        content: "إنشاء ومتابعة إعلانات روضة غراس الموجّهة للمعلمات وأولياء الأمور.",
      },
      { property: "og:title", content: "الإعلانات — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة إعلانات الروضة وجمهورها وحالتها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAnnouncementsPage,
});

type Audience = "all" | "parents" | "teachers";
type State = "published" | "draft" | "archived";
type Tone = "orange" | "blue" | "green" | "yellow" | "pink";
interface Row {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  state: State;
  tone: Tone;
  created_at: string;
}

const audienceLabels: Record<Audience, string> = {
  all: "الجميع",
  parents: "أولياء الأمور",
  teachers: "المعلمات",
};
const stateLabels: Record<State, string> = { published: "منشور", draft: "مسودة", archived: "مؤرشف" };
const stateTone = { published: "green", draft: "yellow", archived: "blue" } as const;
const tones: Tone[] = ["orange", "blue", "green", "yellow", "pink"];
const toneDot: Record<Tone, string> = {
  orange: "bg-brand-orange",
  blue: "bg-brand-blue",
  green: "bg-brand-green",
  yellow: "bg-brand-yellow",
  pink: "bg-brand-pink",
};

const empty = { title: "", body: "", audience: "all" as Audience, tone: "orange" as Tone };

function AdminAnnouncementsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof empty | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,audience,state,tone,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-announcements"] });

  const save = useMutation({
    mutationFn: async (state: State) => {
      if (!form || form.title.trim().length < 2) throw new Error(t("اكتب عنوان الإعلان"));
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        tone: form.tone,
        state,
        updated_at: new Date().toISOString(),
      };
      if (editId) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("announcements")
          .insert({ ...payload, created_by: u.user?.id ?? null });
        if (error) throw error;
      }
      return state;
    },
    onSuccess: (state) => {
      toast.success(state === "published" ? t("تم نشر الإعلان") : t("تم حفظ المسودة"));
      setForm(null);
      setEditId(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const setState = useMutation({
    mutationFn: async ({ id, state }: { id: string; state: State }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ state, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("تم التحديث"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("تم حذف الإعلان"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحذف")),
  });

  const rows = list.data ?? [];
  const published = rows.filter((a) => a.state === "published");
  const others = rows.filter((a) => a.state !== "published");
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(lang === "en" ? "en-GB" : "ar-SA", { day: "numeric", month: "long" });

  const openNew = () => {
    setEditId(null);
    setForm({ ...empty });
  };
  const openEdit = (a: Row) => {
    setEditId(a.id);
    setForm({ title: a.title, body: a.body, audience: a.audience, tone: a.tone });
  };

  const card = (a: Row) => (
    <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-extrabold text-foreground">{a.title}</h3>
        <ToneBadge tone={a.state === "published" ? a.tone : stateTone[a.state]} className="shrink-0">
          {a.state === "published" ? fmt(a.created_at) : t(stateLabels[a.state])}
        </ToneBadge>
      </div>
      {a.body && <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{a.body}</p>}
      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        {t(audienceLabels[a.audience])}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => openEdit(a)} className="inline-flex items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-[11px] font-bold text-foreground">
          <Pencil className="h-3.5 w-3.5" /> {t("تعديل")}
        </button>
        {a.state !== "published" ? (
          <button onClick={() => setState.mutate({ id: a.id, state: "published" })} className="inline-flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground">
            <Send className="h-3.5 w-3.5" /> {t("نشر")}
          </button>
        ) : (
          <button onClick={() => setState.mutate({ id: a.id, state: "archived" })} className="inline-flex items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-[11px] font-bold text-foreground">
            <Archive className="h-3.5 w-3.5" /> {t("أرشفة")}
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm(t("هل تريد حذف هذا الإعلان نهائيًا؟"))) del.mutate(a.id);
          }}
          className="inline-flex items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-[11px] font-bold text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> {t("حذف")}
        </button>
      </div>
    </article>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground">{t("إعلانات الروضة")}</h2>
          <p className="text-xs text-muted-foreground">{t("{count} إعلانًا نشطًا الآن", { count: published.length })}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2.5 text-xs font-extrabold text-primary-foreground transition-transform active:scale-95">
          <Plus className="h-4 w-4" /> {t("إعلان جديد")}
        </button>
      </div>

      {form && (
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-foreground">{editId ? t("تعديل الإعلان") : t("إعلان جديد")}</h3>
            <button onClick={() => { setForm(null); setEditId(null); }} aria-label={t("إغلاق")}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t("عنوان الإعلان")}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder={t("نص الإعلان")}
            rows={4}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />
          <div>
            <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{t("الجمهور")}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(audienceLabels) as Audience[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setForm({ ...form, audience: k })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold ${form.audience === k ? "bg-primary text-primary-foreground" : "border border-border text-foreground"}`}
                >
                  {t(audienceLabels[k])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{t("اللون")}</p>
            <div className="flex gap-2">
              {tones.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, tone: c })}
                  aria-label={c}
                  className={`h-7 w-7 rounded-full ${toneDot[c]} ${form.tone === c ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button disabled={save.isPending} onClick={() => save.mutate("published")} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground disabled:opacity-60">
              <Send className="h-4 w-4" /> {t("نشر")}
            </button>
            <button disabled={save.isPending} onClick={() => save.mutate("draft")} className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground disabled:opacity-60">
              {t("حفظ كمسودة")}
            </button>
          </div>
        </div>
      )}

      <section>
        <SectionHeader title={t("منشورة")} icon={Megaphone} tone="green" />
        {published.length === 0 ? (
          <EmptyState title={t("لا توجد إعلانات")} message={t("أنشئ إعلانًا جديدًا ليظهر للمعلمات وأولياء الأمور.")} />
        ) : (
          <div className="space-y-3">{published.map(card)}</div>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <SectionHeader title={t("مسودات ومؤرشفة")} icon={Megaphone} tone="yellow" />
          <div className="space-y-3">{others.map(card)}</div>
        </section>
      )}
    </div>
  );
}
