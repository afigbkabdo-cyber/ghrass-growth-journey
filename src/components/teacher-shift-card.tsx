import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, LogIn, LogOut, CheckCircle2, CalendarClock, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ToneBadge } from "@/components/ghiras";
import { shiftStatusLabels, shiftStatusTone, useTeacherShift } from "@/lib/teacher-shift";
import { useI18n } from "@/lib/i18n";

/**
 * بطاقة «دوام اليوم» للمعلمة — حضور وانصراف المعلمة نفسها
 * (مستقلة تمامًا عن حضور الأطفال).
 */
export function TeacherShiftCard() {
  const { t, time } = useI18n();
  const { shift, status, hydrated, checkIn, checkOut } = useTeacherShift();
  const [pending, setPending] = useState<"in" | "out" | null>(null);

  const confirm = () => {
    if (pending === "in") {
      const checkedInAt = checkIn();
      toast.success(t("تم تسجيل حضورك بنجاح ✓ — {time}", { time: time(checkedInAt) }));
    } else if (pending === "out") {
      const checkedOutAt = checkOut();
      if (!checkedOutAt) toast.error(t("يجب تسجيل الحضور أولًا."));
      else toast.success(t("تم تسجيل انصرافك بنجاح ✓ — {time}", { time: time(checkedOutAt) }));
    }
    setPending(null);
  };

  const tryCheckOut = () => {
    if (!shift.checkIn) {
      toast.error(t("يجب تسجيل الحضور أولًا."));
      return;
    }
    setPending("out");
  };

  return (
    <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-green-soft">
            <Clock className="h-4.5 w-4.5 text-brand-green-deep" strokeWidth={2.2} />
          </span>
          <span>
            <h2 className="text-base font-bold text-foreground">🌱 {t("دوام اليوم")}</h2>
            <p className="text-[11px] text-muted-foreground">{t("حضور وانصراف المعلمة")}</p>
          </span>
        </span>
        <ToneBadge tone={shiftStatusTone[status]}>{t(shiftStatusLabels[status])}</ToneBadge>
      </div>

      {/* الأوقات */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-brand-green-soft/60 p-3">
          <p className="text-[11px] font-bold text-brand-green-deep">{t("الحضور")}</p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-foreground" dir="ltr">
            {shift.checkIn ? time(shift.checkIn) : "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-brand-pink-soft/60 p-3">
          <p className="text-[11px] font-bold text-brand-pink-deep">{t("الانصراف")}</p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-foreground" dir="ltr">
            {shift.checkOut ? time(shift.checkOut) : "—"}
          </p>
        </div>
      </div>

      {status === "checked_in" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-green-deep">
          <CheckCircle2 className="h-4 w-4" /> {t("تم تسجيل الحضور {time}", { time: shift.checkIn ? time(shift.checkIn) : "" })}
        </p>
      )}
      {status === "completed" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-green-deep">
          <CheckCircle2 className="h-4 w-4" /> {t("اكتمل دوام اليوم")}
        </p>
      )}

      {/* الأزرار */}
      {hydrated && status !== "completed" && (
        <div className="mt-4 grid gap-2">
          {!shift.checkIn ? (
            <button
              onClick={() => setPending("in")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-green py-3.5 text-sm font-extrabold text-white transition-transform active:scale-95"
            >
              <LogIn className="h-4.5 w-4.5" /> 🟢 {t("تسجيل الحضور")}
            </button>
          ) : (
            <button
              onClick={tryCheckOut}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-pink py-3.5 text-sm font-extrabold text-white transition-transform active:scale-95"
            >
              <LogOut className="h-4.5 w-4.5" /> 🔴 {t("تسجيل الانصراف")}
            </button>
          )}
        </div>
      )}

      <Link
        to="/teacher/my-attendance"
        className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground"
      >
        <CalendarClock className="h-4 w-4 text-brand-blue-deep" />
        <span className="flex-1">{t("سجل دوامي")}</span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </Link>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent dir="rtl" className="rounded-3xl text-right">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {pending === "in" ? t("هل تريدين تسجيل حضورك الآن؟") : t("هل تريدين تسجيل انصرافك الآن؟")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("سيُسجَّل الوقت الحالي في سجل دوامك ويمكن للإدارة الاطلاع عليه.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogAction onClick={confirm} className="rounded-xl font-bold">
              {t("تأكيد")}
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-xl font-bold">{t("إلغاء")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
