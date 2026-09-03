import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, ShieldCheck } from "lucide-react";
import { SectionHeader, ToneBadge, Avatar, EmptyState } from "@/components/ghiras";
import { adminThreads, adminPrivacyNote } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [
      { title: "الرسائل — لوحة إدارة غراس" },
      {
        name: "description",
        content: "صندوق وارد إدارة روضة غراس: رسائل المعلمات وأولياء الأمور الموجّهة للإدارة فقط.",
      },
      { property: "og:title", content: "الرسائل — لوحة إدارة غراس" },
      { property: "og:description", content: "تواصل الإدارة مع المعلمات وأولياء الأمور بخصوصية كاملة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const unread = adminThreads.filter((t) => t.unread).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-foreground">صندوق الوارد</h2>
        <p className="text-xs text-muted-foreground">{unread} رسائل غير مقروءة</p>
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-brand-green-soft px-3 py-2.5 text-[11px] font-bold leading-relaxed text-brand-green-deep">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {adminPrivacyNote}
        </p>
      </div>

      <section>
        <SectionHeader title="المحادثات" icon={MessagesSquare} tone="blue" />
        {adminThreads.length === 0 ? (
          <EmptyState title="لا توجد رسائل" message="ستظهر رسائل المعلمات وأولياء الأمور هنا." />
        ) : (
          <div className="space-y-3">
            {adminThreads.map((t) => (
              <article
                key={t.id}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <Avatar name={t.with} tone={t.tone} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{t.with}</p>
                    <span className="shrink-0 text-[11px] font-bold text-muted-foreground">{t.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-bold text-foreground">{t.subject}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.preview}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <ToneBadge tone={t.tone}>{t.role}</ToneBadge>
                    {t.unread && <ToneBadge tone="pink">جديدة</ToneBadge>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
