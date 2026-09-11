import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessagesSquare, Send, ShieldCheck, Plus, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";
import { listThreads, createThread, myChildren } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "رسائل الإدارة — غراس" },
      { name: "description", content: "تواصل ولي الأمر مع إدارة الروضة: إرسال رسالة ومتابعة الرد." },
      { property: "og:title", content: "رسائل الإدارة — غراس" },
      { property: "og:description", content: "تواصل رسمي بين ولي الأمر وإدارة الروضة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <MessagesPage />
    </RoleGuard>
  ),
});



function MessagesPage() {
  const { t, dt } = useI18n();
  const qc = useQueryClient();
  const fetchThreads = useServerFn(listThreads);
  const fetchChildren = useServerFn(myChildren);
  const startThread = useServerFn(createThread);

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [childId, setChildId] = useState<string>("");

  const threads = useQuery({ queryKey: ["parent-threads"], queryFn: () => fetchThreads({}) });
  const children = useQuery({ queryKey: ["my-children"], queryFn: () => fetchChildren({}) });

  const create = useMutation({
    mutationFn: () =>
      startThread({ data: { subject: subject.trim(), body: body.trim(), childId: childId || null } }),
    onSuccess: () => {
      toast.success(t("وصلت رسالتك إلى الإدارة"));
      setSubject("");
      setBody("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["parent-threads"] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر إرسال الرسالة")),
  });

  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        <header className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-pink-soft">
            <MessagesSquare className="h-5.5 w-5.5 text-brand-pink-deep" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">{t("رسائل الإدارة")}</h1>
            <p className="text-xs text-muted-foreground">{t("التواصل الرسمي يكون مع الإدارة")}</p>
          </div>
        </header>

        <p className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-green-soft px-3 py-2.5 text-[11px] font-bold leading-relaxed text-brand-green-deep">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("جميع الاستفسارات — بما فيها ملاحظات المعلمة على طفلك — تُرسل إلى الإدارة وهي من تتابعها معك.")}
        </p>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
        >
          {open ? <X className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
          {t("إرسال رسالة للإدارة")}
        </button>

        {open && (
          <section className="mb-5 space-y-2.5 rounded-3xl border border-brand-orange-soft bg-card p-4 shadow-soft">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("موضوع الرسالة")}
              aria-label={t("موضوع الرسالة")}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft"
            />
            {(children.data ?? []).length > 0 && (
              <select
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                aria-label={t("الطفل")}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="">{t("بخصوص عام (بدون طفل محدد)")}</option>
                {(children.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder={t("اكتب رسالتك للإدارة…")}
              aria-label={t("نص الرسالة")}
              className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:shadow-soft"
            />
            <button
              type="button"
              disabled={create.isPending || subject.trim().length < 2 || body.trim().length < 2}
              onClick={() => create.mutate()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {create.isPending ? t("جارٍ الإرسال…") : t("إرسال")}
            </button>
          </section>
        )}

        <SectionHeader title={t("رسائلي السابقة")} icon={MessagesSquare} tone="pink" />
        {threads.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
        ) : (threads.data ?? []).length === 0 ? (
          <EmptyState title={t("لا توجد رسائل بعد")} message={t("اضغط «إرسال رسالة للإدارة» لبدء أول محادثة.")} />
        ) : (
          <div className="space-y-3">
            {(threads.data ?? []).map((thread) => (
              <Link
                key={thread.id}
                to="/messages/$id"
                params={{ id: thread.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-foreground">{thread.subject}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {thread.childName ? t("بخصوص {name} • ", { name: thread.childName }) : ""}
                    {dt(thread.lastMessageAt)}
                  </p>
                  <div className="mt-2">
                    <ToneBadge tone={thread.status === "closed" ? "green" : "yellow"}>
                      {thread.status === "closed" ? t("مغلقة") : t("قيد المتابعة")}
                    </ToneBadge>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
