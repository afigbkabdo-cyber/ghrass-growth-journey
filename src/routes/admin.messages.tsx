import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessagesSquare, ShieldCheck, ChevronLeft } from "lucide-react";
import { SectionHeader, ToneBadge, Avatar, EmptyState } from "@/components/ghiras";
import { listThreads } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [
      { title: "الرسائل — لوحة إدارة غراس" },
      {
        name: "description",
        content: "صندوق وارد الإدارة: رسائل أولياء الأمور والرد عليها مع سجل المحادثة.",
      },
      { property: "og:title", content: "الرسائل — لوحة إدارة غراس" },
      { property: "og:description", content: "استقبال رسائل أولياء الأمور والرد عليها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const { t, dt } = useI18n();
  const fetchThreads = useServerFn(listThreads);
  const threads = useQuery({ queryKey: ["admin-threads"], queryFn: () => fetchThreads({}) });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-foreground">{t("صندوق الوارد")}</h2>
        <p className="text-xs text-muted-foreground">{t("{count} محادثة مع أولياء الأمور", { count: (threads.data ?? []).length })}</p>
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-brand-green-soft px-3 py-2.5 text-[11px] font-bold leading-relaxed text-brand-green-deep">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("التواصل الرسمي يكون بين ولي الأمر والإدارة فقط — لا توجد مراسلة مباشرة مع المعلمات.")}
        </p>
      </div>

      <section>
        <SectionHeader title={t("المحادثات")} icon={MessagesSquare} tone="blue" />
        {threads.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
        ) : (threads.data ?? []).length === 0 ? (
          <EmptyState title={t("لا توجد رسائل")} message={t("ستظهر رسائل أولياء الأمور هنا.")} />
        ) : (
          <div className="space-y-3">
            {(threads.data ?? []).map((thread) => (
              <Link
                key={thread.id}
                to="/admin/messages/$id"
                params={{ id: thread.id }}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
              >
                <Avatar name={thread.parentName ?? t("ولي أمر")} tone="orange" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{thread.parentName ?? t("ولي أمر")}</p>
                    <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                      {dt(thread.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-bold text-foreground">{thread.subject}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {thread.childName && <ToneBadge tone="blue">{thread.childName}</ToneBadge>}
                    <ToneBadge tone={thread.status === "closed" ? "green" : "yellow"}>
                      {thread.status === "closed" ? t("مغلقة") : t("قيد المتابعة")}
                    </ToneBadge>
                  </div>
                </div>
                <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
