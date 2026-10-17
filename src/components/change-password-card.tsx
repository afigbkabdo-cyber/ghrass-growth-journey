import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const field = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

/** تغيير كلمة مرور الحساب الحالي بعد التحقق من كلمة المرور الحالية. */
export function ChangePasswordCard() {
  const { t: tr } = useI18n();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (next.length < 8) {
      toast.error(tr("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"));
      return;
    }
    if (next !== confirm) {
      toast.error(tr("كلمة المرور الجديدة غير مطابقة للتأكيد"));
      return;
    }
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error(tr("تعذر تغيير كلمة المرور"));

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (signInError) {
        toast.error(tr("كلمة المرور الحالية غير صحيحة"));
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw new Error(error.message);

      toast.success(tr("تم تغيير كلمة المرور"));
      setCurrent("");
      setNext("");
      setConfirm("");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || tr("تعذر تغيير كلمة المرور"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-start"
      >
        <span className="text-sm font-bold text-foreground">{tr("تغيير كلمة المرور")}</span>
        <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="mt-3 space-y-2.5">
          <label className="block text-[11px] font-bold text-muted-foreground">
            {tr("كلمة المرور الحالية")}
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={field}
            />
          </label>
          <label className="block text-[11px] font-bold text-muted-foreground">
            {tr("كلمة المرور الجديدة")}
            <input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={field}
            />
          </label>
          <label className="block text-[11px] font-bold text-muted-foreground">
            {tr("تأكيد كلمة المرور الجديدة")}
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={field}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
          >
            {busy ? tr("جارٍ التغيير…") : tr("تأكيد التغيير")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
