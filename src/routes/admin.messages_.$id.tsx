import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, ToneBadge } from "@/components/ghiras";
import { listThreadMessages, listThreads, sendMessage } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

function AdminThreadError() {
  const { t } = useI18n();
  return <EmptyState title={t("تعذر عرض المحادثة")} message={t("حاول تحديث الصفحة.")} />;
}

function AdminThreadNotFound() {
  const { t } = useI18n();
  return <EmptyState title={t("لم نجد المحادثة")} message={t("ربما حُذفت.")} />;
}

export const Route = createFileRoute("/admin/messages/$id")({
  head: () => ({
    meta: [
      { title: "الرد على ولي الأمر — لوحة إدارة غراس" },
      { name: "description", content: "سجل المحادثة مع ولي الأمر والرد عليه من لوحة الإدارة." },
      { property: "og:title", content: "الرد على ولي الأمر — لوحة إدارة غراس" },
      { property: "og:description", content: "سجل المحادثة مع ولي الأمر والرد عليه." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <AdminThreadError />,
  notFoundComponent: () => <AdminThreadNotFound />,
  component: AdminThreadPage,
});

function AdminThreadPage() {
  const { t, dt } = useI18n();
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchMessages = useServerFn(listThreadMessages);
  const fetchThreads = useServerFn(listThreads);
  const send = useServerFn(sendMessage);
  const [draft, setDraft] = useState("");

  const messages = useQuery({
    queryKey: ["thread-messages", id],
    queryFn: () => fetchMessages({ data: { threadId: id } }),
  });
  const threads = useQuery({ queryKey: ["admin-threads"], queryFn: () => fetchThreads({}) });
  const thread = (threads.data ?? []).find((t) => t.id === id);

  const reply = useMutation({
    mutationFn: () => send({ data: { threadId: id, body: draft.trim() } }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["thread-messages", id] });
      qc.invalidateQueries({ queryKey: ["admin-threads"] });
      toast.success(t("تم إرسال الرد لولي الأمر"));
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الإرسال")),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
        <Link to="/admin/messages" aria-label={t("عودة")} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-extrabold text-foreground">{thread?.subject ?? t("محادثة")}</h1>
          <p className="text-[11px] text-muted-foreground">{thread?.parentName ?? t("ولي أمر")}</p>
        </div>
        {thread?.childName && <ToneBadge tone="blue">{thread.childName}</ToneBadge>}
      </div>

      <div className="space-y-3">
        {(messages.data ?? []).map((m) => {
          const mine = m.senderRole === "admin";
          return (
            <div key={m.id} className={`flex ${mine ? "flex-row-reverse justify-start" : ""}`}>
              <div
                className={
                  mine
                    ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-brand-blue px-4 py-2.5 shadow-soft"
                    : "max-w-[80%] rounded-2xl rounded-tr-sm border border-border bg-card px-4 py-2.5 shadow-soft"
                }
              >
                <p className={`whitespace-pre-line text-sm leading-relaxed ${mine ? "text-primary-foreground" : "text-foreground"}`}>
                  {m.body}
                </p>
                <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  {mine ? t("الإدارة") : (thread?.parentName ?? t("ولي الأمر"))} •{" "}
                  {dt(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) reply.mutate();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("اكتب الرد لولي الأمر…")}
          className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label={t("إرسال")}
          disabled={reply.isPending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50"
        >
          <SendHorizonal className="h-5 w-5 -scale-x-100" />
        </button>
      </form>
    </div>
  );
}
