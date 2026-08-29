import { createFileRoute, Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { PageContainer, Avatar, ToneBadge } from "@/components/ghiras";
import { teacherConversations } from "@/lib/teacher-data";

export const Route = createFileRoute("/teacher/messages")({
  head: () => ({
    meta: [
      { title: "رسائل المعلمة — غراس" },
      {
        name: "description",
        content: "صندوق رسائل المعلمة للتواصل مع أولياء أمور أطفال فصلها وإدارة الروضة.",
      },
      { property: "og:title", content: "رسائل المعلمة — غراس" },
      { property: "og:description", content: "تواصل المعلمة مع أولياء الأمور والإدارة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherMessagesPage,
});

function TeacherMessagesPage() {
  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-pink-soft">
          <MessagesSquare className="h-5.5 w-5.5 text-brand-pink-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">الرسائل</h1>
          <p className="text-xs text-muted-foreground">أولياء أمور فصلي والإدارة فقط</p>
        </div>
      </header>

      <div className="space-y-3">
        {teacherConversations.map((c) => (
          <Link
            key={c.id}
            to="/teacher/messages/$id"
            params={{ id: c.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
          >
            <div className="relative">
              <Avatar name={c.childName} tone={c.tone} size="lg" />
              {c.unread > 0 && (
                <span className="absolute -top-1 -start-1 grid h-5 w-5 place-items-center rounded-full bg-brand-pink text-[10px] font-extrabold text-primary-foreground ring-2 ring-card">
                  {c.unread}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-extrabold text-foreground">{c.childName}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="truncate text-[11px] font-medium text-muted-foreground">{c.guardian}</p>
                <ToneBadge tone={c.kind === "admin" ? "orange" : "blue"} className="shrink-0">
                  {c.kind === "admin" ? "الإدارة" : "ولي أمر"}
                </ToneBadge>
              </div>
              <p
                className={`mt-1 truncate text-xs ${c.unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}
              >
                {c.lastMessage}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
