import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessagesSquare, ShieldCheck, ChevronLeft } from "lucide-react";
import { SectionHeader, ToneBadge, Avatar, EmptyState } from "@/components/ghiras";
import { listThreads } from "@/lib/kg.functions";

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
  const fetchThreads = useServerFn(listThreads);
  const threads = useQuery({ queryKey: ["admin-threads"], queryFn: () => fetchThreads({}) });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-foreground">صندوق الوارد</h2>
        <p className="text-xs text-muted-foreground">{(threads.data ?? []).length} محادثة مع أولياء الأمور</p>
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-brand-green-soft px-3 py-2.5 text-[11px] font-bold leading-relaxed text-brand-green-deep">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          التواصل الرسمي يكون بين ولي الأمر والإدارة فقط — لا توجد مراسلة مباشرة مع المعلمات.
        </p>
      </div>

      <section>
        <SectionHeader title="المحادثات" icon={MessagesSquare} tone="blue" />
        {threads.isLoading ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : (threads.data ?? []).length === 0 ? (
          <EmptyState title="لا توجد رسائل" message="ستظهر رسائل أولياء الأمور هنا." />
        ) : (
          <div className="space-y-3">
            {(threads.data ?? []).map((t) => (
              <Link
                key={t.id}
                to="/admin/messages/$id"
                params={{ id: t.id }}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
              >
                <Avatar name={t.parentName ?? "ولي أمر"} tone="orange" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{t.parentName ?? "ولي أمر"}</p>
                    <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                      {new Date(t.lastMessageAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-bold text-foreground">{t.subject}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {t.childName && <ToneBadge tone="blue">{t.childName}</ToneBadge>}
                    <ToneBadge tone={t.status === "closed" ? "green" : "yellow"}>
                      {t.status === "closed" ? "مغلقة" : "قيد المتابعة"}
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
