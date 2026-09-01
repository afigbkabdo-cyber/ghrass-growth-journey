/**
 * دوام المعلمة (حضور/انصراف المعلمة نفسها) — بيانات تجريبية فقط.
 * الحقول جاهزة للربط لاحقًا بجدول teacher_attendance:
 * teacher_id | date | check_in | check_out | status
 */

import { useCallback, useEffect, useState } from "react";

export type ShiftStatus = "absent" | "checked_in" | "completed";

export interface TeacherShiftRecord {
  /** teacher_id مستقبلًا */
  teacherId: string;
  /** YYYY-MM-DD */
  date: string;
  /** اسم اليوم بالعربية للعرض */
  dayLabel: string;
  /** HH:mm بصيغة 24 ساعة */
  checkIn: string | null;
  checkOut: string | null;
  status: ShiftStatus;
}

export const shiftStatusLabels: Record<ShiftStatus, string> = {
  absent: "لم يُسجَّل",
  checked_in: "حاضرة",
  completed: "مكتمل",
};

export const shiftStatusTone: Record<ShiftStatus, "pink" | "yellow" | "green"> = {
  absent: "pink",
  checked_in: "yellow",
  completed: "green",
};

/** تحويل 24h إلى صيغة عربية 12h مع ص/م */
export function formatArabicTime(hhmm: string | null): string {
  if (!hhmm) return "—";
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr ?? 0);
  const m = mStr ?? "00";
  const suffix = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${m} ${suffix}`;
}

export const teacherShiftHistory: TeacherShiftRecord[] = [
  { teacherId: "t1", date: "2026-08-30", dayLabel: "الأحد", checkIn: "07:35", checkOut: "13:45", status: "completed" },
  { teacherId: "t1", date: "2026-08-31", dayLabel: "الإثنين", checkIn: "07:42", checkOut: "13:40", status: "completed" },
  { teacherId: "t1", date: "2026-09-01", dayLabel: "الثلاثاء", checkIn: "08:05", checkOut: null, status: "checked_in" },
  { teacherId: "t1", date: "2026-08-26", dayLabel: "الأربعاء", checkIn: "07:30", checkOut: "13:50", status: "completed" },
  { teacherId: "t1", date: "2026-08-25", dayLabel: "الثلاثاء", checkIn: null, checkOut: null, status: "absent" },
];

const STORAGE_KEY = "ghiras.teacher.shift";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export interface TodayShift {
  checkIn: string | null;
  checkOut: string | null;
}

const empty: TodayShift = { checkIn: null, checkOut: null };

/** حالة دوام اليوم — محفوظة محليًا حتى ربط قاعدة البيانات */
export function useTeacherShift() {
  const [shift, setShift] = useState<TodayShift>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TodayShift & { date?: string };
        if (parsed.date === todayKey()) {
          setShift({ checkIn: parsed.checkIn ?? null, checkOut: parsed.checkOut ?? null });
        }
      }
    } catch {
      /* تجاهل */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: TodayShift) => {
    setShift(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, date: todayKey() }));
    } catch {
      /* تجاهل */
    }
  }, []);

  const status: ShiftStatus = shift.checkOut ? "completed" : shift.checkIn ? "checked_in" : "absent";

  const checkIn = useCallback(() => {
    const time = nowHHMM();
    persist({ checkIn: time, checkOut: null });
    return time;
  }, [persist]);

  const checkOut = useCallback(() => {
    if (!shift.checkIn) return null;
    const time = nowHHMM();
    persist({ checkIn: shift.checkIn, checkOut: time });
    return time;
  }, [persist, shift.checkIn]);

  return { shift, status, hydrated, checkIn, checkOut };
}
