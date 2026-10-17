import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, SendHorizonal, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessagePhoto } from "@/components/message-photo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, EmptyState } from "@/components/ghiras";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";
import { listThreadMessages, listThreads, sendMessage } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

function ThreadErrorState() {
  const { t } = useI18n();
  return (
    <PageContainer>
      <EmptyState title={t("تعذر عرض المحادثة")} message={t("حاول تحديث الصفحة.")} />
    </PageContainer>
  );
}

function ThreadNotFoundState() {
  const { t } = useI18n();
  return (
    <PageContainer>
      <EmptyState title={t("لم نجد المحادثة")} message={t("ربما حُذفت أو لا تملك صلاحية عرضها.")} />
    </PageContainer>
  );
}

export const Route = createFileRoute("/messages_/$id")({
  head: () => ({
    meta: [
      { title: "محادثة مع الإدارة — غراس" },
      { name: "description", content: "متابعة محادثة ولي الأمر مع إدارة روضة غراس." },
      { property: "og:title", content: "محادثة مع الإدارة — غراس" },
      { property: "og:description", content: "متابعة محادثة ولي الأمر مع إدارة الروضة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <ThreadErrorState />,
  notFoundComponent: () => <ThreadNotFoundState />,
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <ThreadPage />
    </RoleGuard>
  ),
});

function ThreadPage() {
  const { t, dt } = useI18n();
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchMessages = useServerFn(listThreadMessages);
  const fetchThreads = useServerFn(listThreads);
  const send = useServerFn(sendMessage);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploaded = useRef<{file:File;path:string} | null>(null);

  const messages = useQuery({
    queryKey: ["thread-messages", id],
    queryFn: () => fetchMessages({ data: { threadId: id } }),
    refetchInterval: 15000,
  });
  const threads = useQuery({ queryKey: ["parent-threads"], queryFn: () => fetchThreads({}) });
  const thread = (threads.data ?? []).find((t) => t.id === id);

  const reply = useMutation({
    mutationFn: async () => {
      let photoPath: string | undefined;
      if(photo) {
        if(uploaded.current?.file===photo) photoPath=uploaded.current.path;
        else {
          const {data:{user}}=await supabase.auth.getUser();
          if(!user) throw new Error(t("تعذر الإرسال"));
          const ext=photo.type==='image/png'?'png':photo.type==='image/webp'?'webp':'jpg';
          photoPath=`${id}/${user.id}/${crypto.randomUUID()}.${ext}`;
          const {error}=await supabase.storage.from('message-photos').upload(photoPath,photo,{contentType:photo.type});
          if(error) throw new Error(t("تعذر رفع الصورة"));
          uploaded.current={file:photo,path:photoPath};
        }
      }
      return send({data:{threadId:id,body:draft.trim(),photoPath}});
    },
    onSuccess: () => {
      setDraft(""); setPhoto(null); uploaded.current=null;
      if(fileInput.current) fileInput.current.value="";
      qc.invalidateQueries({ queryKey: ["thread-messages", id] });
      qc.invalidateQueries({ queryKey: ["parent-threads"] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الإرسال")),
  });

  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer className="pb-36">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
          <Link to="/messages" aria-label={t("عودة للرسائل")} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold text-foreground">
              {thread?.subject ?? t("محادثة مع الإدارة")}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {thread?.childName ? t("بخصوص {name} • ", { name: thread.childName }) : ""}{t("إدارة الروضة")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {(messages.data ?? []).map((m) => {
            const mine = m.senderRole === "parent";
            return (
              <div key={m.id} className={`flex ${mine ? "flex-row-reverse justify-start" : ""}`}>
                <div
                  className={
                    mine
                      ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-brand-green px-4 py-2.5 shadow-soft"
                      : "max-w-[80%] rounded-2xl rounded-tr-sm border border-border bg-card px-4 py-2.5 shadow-soft"
                  }
                >
                  <MessagePhoto url={m.photoUrl} />
                  <p
                    className={`whitespace-pre-line text-sm leading-relaxed ${mine ? "text-primary-foreground" : "text-foreground"}`}
                  >
                    {m.body}
                  </p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                    {mine ? t("أنت") : t("الإدارة")} •{" "}
                    {dt(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border/70 bg-background/90 backdrop-blur-md">
          {photo && <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 pt-2 text-xs"><span className="min-w-0 truncate">{photo.name}</span><Button size="icon" variant="ghost" aria-label={t("إزالة الصورة")} disabled={reply.isPending} onClick={()=>{setPhoto(null);if(fileInput.current) fileInput.current.value="";}}><X/></Button></div>}
          <form
            className="mx-auto flex w-full max-w-2xl items-center gap-2 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim() || photo) reply.mutate();
            }}
          >
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label={t("إرفاق صورة")} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024){toast.error(t("اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 10 ميجابايت"));e.target.value="";return;}setPhoto(f);}} />
            <Button type="button" size="icon" variant="outline" className="h-11 w-11 shrink-0 rounded-2xl" aria-label={t("إرفاق صورة")} disabled={reply.isPending} onClick={()=>fileInput.current?.click()}><ImagePlus/></Button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("اكتب رسالتك للإدارة…")}
              className="h-11 min-w-0 flex-1 rounded-2xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="submit"
              aria-label={t("إرسال")}
              disabled={reply.isPending}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
            >
              <SendHorizonal className="h-5 w-5 -scale-x-100" />
            </Button>
          </form>
        </div>
      </PageContainer>
    </AppShell>
  );
}
