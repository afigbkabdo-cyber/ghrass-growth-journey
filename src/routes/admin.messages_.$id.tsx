import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, SendHorizonal, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageMediaList } from "@/components/message-photo";
import { uploadMessageMedia } from "@/lib/message-photo-upload";
import { MAX_FILES, mediaType } from "@/lib/message-media";
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

export const Route = createFileRoute("/admin/messages_/$id")({
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
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploaded = useRef(new Map<File, { path: string; kind: 'image' | 'video' }>());
  useEffect(() => {
    const next = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach(item => URL.revokeObjectURL(item.url));
  }, [files]);
  const uploadError = (error: unknown) => {
    const code = error instanceof Error ? error.message : '';
    if (code === 'video-type' || code === 'video-size') return t('اختر فيديو MP4 أو MOV أو WebM بحجم لا يتجاوز 50 ميجابايت');
    if (code === 'unsupported') return t('اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 10 ميجابايت');
    return t('تعذر رفع المرفق. لم تُرسل الرسالة؛ حاول مجددًا.');
  };

  const messages = useQuery({
    queryKey: ["thread-messages", id],
    queryFn: () => fetchMessages({ data: { threadId: id } }),
    refetchInterval: 15000,
  });
  const threads = useQuery({ queryKey: ["admin-threads"], queryFn: () => fetchThreads({}) });
  const thread = (threads.data ?? []).find((t) => t.id === id);

  const reply = useMutation({
    mutationFn: async () => {
      const attachments: { path: string; kind: 'image' | 'video' }[] = [];
      for (const file of files) {
        let attachment = uploaded.current.get(file);
        if (!attachment) {
          attachment = await uploadMessageMedia(id, file).catch(error => { throw new Error(uploadError(error)); });
          uploaded.current.set(file, attachment);
        }
        attachments.push(attachment);
      }
      return send({ data: { threadId: id, body: draft.trim(), attachments } }).catch(() => { throw new Error(t('تعذر إرسال الرسالة. احتُفظ بالنص والمرفقات لإعادة المحاولة.')); });
    },
    onSuccess: () => {
      setDraft("");
      setFiles([]);
      uploaded.current.clear();
      if (fileInput.current) fileInput.current.value = "";
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
                <MessageMediaList items={m.media} unavailable={m.unavailableMedia} />
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

      {previews.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={t('إرفاق صور أو فيديو')}>{previews.map(({ file, url }, index) => <div key={url} className="min-w-0">
        {mediaType(file) === 'video' ? <video src={url} controls playsInline className="h-32 w-full rounded-xl bg-muted object-contain" /> : <img src={url} alt={file.name} className="h-32 w-full rounded-xl bg-muted object-contain" />}
        <div className="flex items-center gap-1"><span className="min-w-0 flex-1 truncate text-xs">{file.name}</span><Button type="button" size="icon" variant="ghost" aria-label={t('إزالة المرفق')} disabled={reply.isPending} onClick={() => setFiles(current => current.filter((_, i) => i !== index))}><X /></Button></div>
      </div>)}</div>}
      <form
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.isPending && (draft.trim() || files.length)) reply.mutate();
        }}
      >
        <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm,.heic,.heif,.mov,.m4v" aria-label={t('إرفاق صور أو فيديو')} className="hidden" disabled={reply.isPending} onChange={e => {
          const selected = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length + selected.length > MAX_FILES) { toast.error(t('اختر حتى 10 مرفقات')); return; }
          try { selected.forEach(file => mediaType(file)); setFiles(current => [...current, ...selected]); } catch (error) { toast.error(uploadError(error)); }
        }} />
        <Button type="button" size="icon" variant="outline" className="h-11 w-11 shrink-0 rounded-2xl" aria-label={t('إرفاق صور أو فيديو')} disabled={reply.isPending} onClick={() => fileInput.current?.click()}><ImagePlus /></Button>
        <input
          value={draft}
          disabled={reply.isPending}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("اكتب الرد لولي الأمر…")}
          className="h-11 min-w-0 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
        />
        <Button
          type="submit"
          aria-label={t("إرسال")}
          disabled={reply.isPending || (!draft.trim() && !files.length)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50"
        >
          <SendHorizonal className="h-5 w-5 -scale-x-100" />
        </Button>
      </form>
    </div>
  );
}
