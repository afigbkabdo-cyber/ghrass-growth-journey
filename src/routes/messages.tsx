import { createFileRoute, Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { Avatar, PageContainer, toneClasses } from "@/components/ghiras";
import { conversations } from "@/lib/data";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "الرسائل — غراس" },
      { name: "description", content: "تواصل مباشر وآمن بين ولي الأمر ومعلمات الروضة والإدارة." },
      { property: "og:title", content: "الرسائل — غراس" },
      { property: "og:description", content: "تواصل مباشر وآمن بين ولي الأمر ومعلمات الروضة والإدارة." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        <header className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-pink-soft">
            <MessagesSquare className="h-5.5 w-5.5 text-brand-pink-deep" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">الرسائل</h1>
            <p className="text-xs text-muted-foreground">تواصلك مع معلمات {conversations.length > 0 ? "ليان" : "طفلك"} والإدارة</p>
          </div>
        </header>

        <div className="space-y-3">
          {conversations.map((c) => {
            const t = toneClasses[c.tone];
            return (
              <Link
                key={c.id}
                to="/chat"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
              >
                <div className="relative">
                  <Avatar name={c.with} tone={c.tone} size="lg" />
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -start-1 grid h-5 w-5 place-items-center rounded-full bg-brand-pink text-[10px] font-extrabold text-primary-foreground ring-2 ring-card">
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-extrabold text-foreground">{c.with}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground">{c.role}</p>
                  <p className={`mt-1 truncate text-xs ${c.unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                    {c.lastMessage}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </AppShell>
  );
}
