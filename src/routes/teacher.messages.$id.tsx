import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Send } from "lucide-react";
import { Avatar, EmptyState, ToneBadge } from "@/components/ghiras";
import { teacherConversations, teacherThreads, type TeacherChatMessage } from "@/lib/teacher-data";

export const Route = createFileRoute("/teacher/messages/$id")({
  loader: ({ params }) => {
    const conversation = teacherConversations.find((c) => c.id === params.id);
    if (!conversation) throw notFound();
    return { conversation };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "المحادثة غير متوفرة — غراس" }, { name: "robots", content: "noindex" }] };
    }
    const title = `محادثة ${loaderData.conversation.childName} — غراس`;
    return {
      meta: [
        { title },
        { name: "description", content: "محادثة المعلمة مع ولي الأمر داخل تطبيق غراس." },
        { property: "og:title", content: title },
        { property: "og:description", content: "محادثة المعلمة مع ولي الأمر داخل تطبيق غراس." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: ThreadNotFound,
  component: TeacherThreadPage,
});

function ThreadNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-10 pb-28">
      <EmptyState title="المحادثة غير موجودة" message="ربما حُذفت المحادثة أو الرابط غير صحيح." />
      <div className="mt-4 text-center">
        <Link to="/teacher/messages" className="text-sm font-bold text-primary">
          الرجوع إلى الرسائل
        </Link>
      </div>
    </div>
  );
}

function TeacherThreadPage() {
  const { conversation } = Route.useLoaderData();
  const [messages, setMessages] = useState<TeacherChatMessage[]>(
    teacherThreads[conversation.id] ?? [],
  );
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${prev.length + 1}`, from: "teacher", text, time: "الآن" },
    ]);
    setDraft("");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 pt-4 pb-28">
      <header className="mb-4 flex items-center gap-3">
        <Link
          to="/teacher/messages"
          aria-label="رجوع"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-muted"
        >
          <ArrowRight className="h-4.5 w-4.5 text-muted-foreground" />
        </Link>
        <Avatar name={conversation.childName} tone={conversation.tone} />
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold text-foreground">
            {conversation.guardian}
          </h1>
          <p className="truncate text-[11px] text-muted-foreground">{conversation.childName}</p>
        </div>
        <ToneBadge tone={conversation.kind === "admin" ? "orange" : "blue"} className="ms-auto">
          {conversation.kind === "admin" ? "الإدارة" : "ولي أمر"}
        </ToneBadge>
      </header>

      <div className="flex-1 space-y-2.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "teacher" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                m.from === "teacher"
                  ? "bg-brand-blue-soft text-brand-blue-deep"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              <p className="mt-1 text-[10px] opacity-70">{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-24 mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="اكتب رسالتك…"
          aria-label="نص الرسالة"
          className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="إرسال"
          className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
