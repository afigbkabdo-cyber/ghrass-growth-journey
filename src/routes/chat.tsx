import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, parentNav } from "@/components/shells";
import { Avatar, PageContainer, SuccessNote } from "@/components/ghiras";
import { chatThread, conversations } from "@/lib/data";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "محادثة — غراس" },
      { name: "description", content: "محادثة مباشرة مع معلمة طفلك." },
      { property: "og:title", content: "محادثة — غراس" },
      { property: "og:description", content: "محادثة مباشرة مع معلمة طفلك." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const conv = conversations[0];
  const [messages, setMessages] = useState(chatThread);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `local-${m.length}`, from: "parent", text, time: "الآن" }]);
    setDraft("");
    setSent(true);
    toast.success("أُرسلت رسالتك إلى المعلمة (عرض تجريبي)");
  };

  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer className="pb-36">
        {/* رأس المحادثة */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
          <Link to="/messages" aria-label="عودة للرسائل" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Avatar name={conv.with} tone={conv.tone} />
          <div>
            <h1 className="text-sm font-extrabold text-foreground">{conv.with}</h1>
            <p className="text-[11px] text-muted-foreground">{conv.role} • متصلة عادةً صباحًا</p>
          </div>
        </div>

        {sent && (
          <div className="mb-4">
            <SuccessNote>وصلت رسالتك — سترد المعلمة في أقرب وقت بإذن الله.</SuccessNote>
          </div>
        )}

        {/* الرسائل */}
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "parent" ? "justify-start flex-row-reverse" : ""}`}>
              <div
                className={
                  m.from === "parent"
                    ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-brand-green px-4 py-2.5 text-primary-foreground shadow-soft"
                    : "max-w-[80%] rounded-2xl rounded-tr-sm border border-border bg-card px-4 py-2.5 shadow-soft"
                }
              >
                <p className={`text-sm leading-relaxed ${m.from === "parent" ? "text-primary-foreground" : "text-foreground"}`}>
                  {m.text}
                </p>
                <p className={`mt-1 text-[10px] ${m.from === "parent" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* صندوق الإدخال */}
        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border/70 bg-background/90 backdrop-blur-md">
          <form
            className="mx-auto flex w-full max-w-2xl items-center gap-2 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="اكتب رسالتك للمعلمة…"
              className="h-11 flex-1 rounded-2xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              aria-label="إرسال"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95"
            >
              <SendHorizonal className="h-5 w-5 -scale-x-100" />
            </button>
          </form>
        </div>
      </PageContainer>
    </AppShell>
  );
}
