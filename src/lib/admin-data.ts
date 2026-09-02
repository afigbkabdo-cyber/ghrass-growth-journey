/**
 * بيانات تجريبية للإدارة والمالكين — واجهة فقط (Prototype).
 * الحقول مُهيّأة للربط لاحقًا بجداول:
 * teacher_attendance | activities | announcements | invoices | payments
 */

import type { Tone } from "@/lib/data";

/* ---------- حضور وانصراف المعلمات ---------- */

export type StaffShiftStatus = "completed" | "checked_in" | "late" | "absent";

export const staffShiftStatusLabels: Record<StaffShiftStatus, string> = {
  completed: "مكتمل",
  checked_in: "حاضرة",
  late: "متأخرة",
  absent: "غائبة",
};

export const staffShiftStatusTone: Record<StaffShiftStatus, Tone> = {
  completed: "green",
  checked_in: "blue",
  late: "yellow",
  absent: "pink",
};

export interface StaffAttendanceRow {
  /** teacher_id مستقبلًا */
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  /** YYYY-MM-DD */
  date: string;
  dayLabel: string;
  checkIn: string | null;
  checkOut: string | null;
  status: StaffShiftStatus;
  /** التأخير بالدقائق */
  lateMinutes: number;
  tone: Tone;
}

export const staffAttendanceToday: StaffAttendanceRow[] = [
  { teacherId: "t1", teacherName: "أ. نورة العتيبي", subject: "اللغة العربية", className: "فصل البراعم", date: "2026-09-02", dayLabel: "الأربعاء", checkIn: "07:35", checkOut: "13:45", status: "completed", lateMinutes: 0, tone: "orange" },
  { teacherId: "t2", teacherName: "أ. سارة القحطاني", subject: "الرياضيات", className: "فصل الأوراق", date: "2026-09-02", dayLabel: "الأربعاء", checkIn: "07:42", checkOut: null, status: "checked_in", lateMinutes: 0, tone: "blue" },
  { teacherId: "t3", teacherName: "أ. ريم الشمري", subject: "اللغة الإنجليزية", className: "فصل الأوراق", date: "2026-09-02", dayLabel: "الأربعاء", checkIn: "08:12", checkOut: null, status: "late", lateMinutes: 22, tone: "green" },
  { teacherId: "t4", teacherName: "أ. حصة الدوسري", subject: "مشرفة الحضانة", className: "فصل البذور", date: "2026-09-02", dayLabel: "الأربعاء", checkIn: null, checkOut: null, status: "absent", lateMinutes: 0, tone: "pink" },
];

export const staffAttendanceHistory: StaffAttendanceRow[] = [
  ...staffAttendanceToday,
  { teacherId: "t1", teacherName: "أ. نورة العتيبي", subject: "اللغة العربية", className: "فصل البراعم", date: "2026-09-01", dayLabel: "الثلاثاء", checkIn: "07:31", checkOut: "13:40", status: "completed", lateMinutes: 0, tone: "orange" },
  { teacherId: "t2", teacherName: "أ. سارة القحطاني", subject: "الرياضيات", className: "فصل الأوراق", date: "2026-09-01", dayLabel: "الثلاثاء", checkIn: "08:05", checkOut: "13:50", status: "late", lateMinutes: 15, tone: "blue" },
  { teacherId: "t3", teacherName: "أ. ريم الشمري", subject: "اللغة الإنجليزية", className: "فصل الأوراق", date: "2026-09-01", dayLabel: "الثلاثاء", checkIn: "07:38", checkOut: "13:45", status: "completed", lateMinutes: 0, tone: "green" },
  { teacherId: "t4", teacherName: "أ. حصة الدوسري", subject: "مشرفة الحضانة", className: "فصل البذور", date: "2026-09-01", dayLabel: "الثلاثاء", checkIn: "07:29", checkOut: "13:35", status: "completed", lateMinutes: 0, tone: "pink" },
];

/* ---------- الأنشطة (نظرة الإدارة) ---------- */

export type AdminActivityState = "draft" | "published" | "archived";

export const adminActivityStateLabels: Record<AdminActivityState, string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

export const adminActivityStateTone: Record<AdminActivityState, Tone> = {
  draft: "yellow",
  published: "green",
  archived: "blue",
};

export interface AdminActivity {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  className: string;
  value: string;
  date: string;
  state: AdminActivityState;
  tone: Tone;
}

export const adminActivities: AdminActivity[] = [
  { id: "aa1", title: "حكاية «الراعي الصادق»", subject: "اللغة العربية", teacher: "أ. نورة العتيبي", className: "فصل البراعم", value: "الصدق", date: "٢ سبتمبر", state: "published", tone: "orange" },
  { id: "aa2", title: "لوحة الأعداد الصادقة", subject: "الرياضيات", teacher: "أ. سارة القحطاني", className: "فصل الأوراق", value: "الصدق", date: "٢ سبتمبر", state: "published", tone: "blue" },
  { id: "aa3", title: "Honesty Song", subject: "اللغة الإنجليزية", teacher: "أ. ريم الشمري", className: "فصل الأوراق", value: "الصدق", date: "٣ سبتمبر", state: "draft", tone: "green" },
  { id: "aa4", title: "لعبة الصندوق الأمين", subject: "مشرفة الحضانة", teacher: "أ. حصة الدوسري", className: "فصل البذور", value: "الصدق", date: "١ سبتمبر", state: "published", tone: "pink" },
  { id: "aa5", title: "ركن التعاون الحركي", subject: "اللغة العربية", teacher: "أ. نورة العتيبي", className: "فصل البراعم", value: "التعاون", date: "٢٥ أغسطس", state: "archived", tone: "yellow" },
];

/* ---------- إعلانات الإدارة ---------- */

export type AnnouncementAudience = "all" | "teachers" | "parents" | "class";

export const audienceLabels: Record<AnnouncementAudience, string> = {
  all: "كل الروضة",
  teachers: "المعلمات",
  parents: "أولياء الأمور",
  class: "فصل محدد",
};

export type AnnouncementState = "draft" | "published" | "archived";

export const announcementStateLabels: Record<AnnouncementState, string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

export interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  audienceDetail?: string;
  date: string;
  state: AnnouncementState;
  tone: Tone;
}

export const adminAnnouncements: AdminAnnouncement[] = [
  { id: "an1", title: "انطلاق قيمة الأسبوع: الصدق", body: "تبدأ أنشطة قيمة الصدق من الأحد، ونرجو تعاون الأسرة في نشاط المنزل.", audience: "all", date: "١ سبتمبر", state: "published", tone: "orange" },
  { id: "an2", title: "اجتماع الكادر التعليمي", body: "اجتماع تحضيري لخطة القيم القادمة، الخميس ١٢:٣٠م في قاعة الاجتماعات.", audience: "teachers", date: "٢ سبتمبر", state: "published", tone: "blue" },
  { id: "an3", title: "رحلة فصل الأوراق", body: "رحلة تعليمية إلى مزرعة غراس — يُرجى توقيع الموافقة.", audience: "class", audienceDetail: "فصل الأوراق", date: "٤ سبتمبر", state: "draft", tone: "green" },
  { id: "an4", title: "تذكير بمواعيد الحضور", body: "بدء الطابور الصباحي ٧:٣٠ص، ونعتمد على دقة الحضور.", audience: "parents", date: "٢٨ أغسطس", state: "archived", tone: "yellow" },
];

/* ---------- صندوق الوارد الإداري ---------- */

export interface AdminThread {
  id: string;
  with: string;
  role: "معلمة" | "ولي أمر";
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tone: Tone;
}

export const adminThreads: AdminThread[] = [
  { id: "at1", with: "أ. نورة العتيبي", role: "معلمة", subject: "طلب مواد نشاط الصدق", preview: "أحتاج لوحات وأقلام إضافية لنشاط الأسبوع.", time: "٠٨:٤٠ص", unread: true, tone: "orange" },
  { id: "at2", with: "أم ليان", role: "ولي أمر", subject: "استفسار عن الرسوم", preview: "هل يمكن تقسيط الرسوم على دفعتين؟", time: "أمس", unread: true, tone: "pink" },
  { id: "at3", with: "أ. حصة الدوسري", role: "معلمة", subject: "إشعار غياب", preview: "سأتأخر اليوم لظرف طبي.", time: "أمس", unread: false, tone: "blue" },
  { id: "at4", with: "أبو فيصل", role: "ولي أمر", subject: "طلب تقرير تطور", preview: "أرجو تزويدي بتقرير فيصل الشهري.", time: "٣١ أغسطس", unread: false, tone: "green" },
];

export const adminPrivacyNote =
  "الإدارة ترى الرسائل الموجّهة إليها فقط — المحادثات الخاصة بين المعلمة وولي الأمر محمية ولا تُعرض تلقائيًا.";

/* ---------- التقارير ---------- */

export const weeklyChildAttendance = [
  { day: "الأحد", present: 26, absent: 2 },
  { day: "الإثنين", present: 25, absent: 3 },
  { day: "الثلاثاء", present: 27, absent: 1 },
  { day: "الأربعاء", present: 25, absent: 3 },
  { day: "الخميس", present: 24, absent: 4 },
];

export const weeklyStaffAttendance = [
  { day: "الأحد", present: 4, late: 0 },
  { day: "الإثنين", present: 4, late: 1 },
  { day: "الثلاثاء", present: 4, late: 1 },
  { day: "الأربعاء", present: 3, late: 1 },
  { day: "الخميس", present: 4, late: 0 },
];

export const reportCards = [
  { id: "r1", title: "حضور الأطفال", value: "٨٩٪", note: "متوسط الأسبوع الحالي", tone: "green" as Tone },
  { id: "r2", title: "غياب الأطفال", value: "١١٪", note: "١٣ حالة غياب هذا الأسبوع", tone: "pink" as Tone },
  { id: "r3", title: "حضور المعلمات", value: "٩٥٪", note: "١٩ من ٢٠ دوامًا", tone: "blue" as Tone },
  { id: "r4", title: "غياب المعلمات", value: "١", note: "حالة غياب واحدة", tone: "yellow" as Tone },
  { id: "r5", title: "الأنشطة المنشورة", value: "١٢", note: "خلال الأسبوع", tone: "orange" as Tone },
  { id: "r6", title: "القيم المعتمدة", value: "٤", note: "من خطة الفصل الأول", tone: "green" as Tone },
];

export const developmentReport = [
  { domain: "اللغة والتواصل", value: 82, tone: "orange" as Tone },
  { domain: "المهارات الاجتماعية", value: 88, tone: "blue" as Tone },
  { domain: "القيم والسلوك", value: 91, tone: "green" as Tone },
  { domain: "المهارات الحركية", value: 76, tone: "yellow" as Tone },
];

/* ---------- المالية ---------- */

export const financeSummary = {
  revenue: 168000,
  expenses: 96500,
  dues: 24500,
  collected: 143500,
  currency: "ر.س",
};

export interface FeePlan {
  id: string;
  stage: string;
  termFee: number;
  yearFee: number;
  children: number;
}

export const feePlans: FeePlan[] = [
  { id: "f1", stage: "الحضانة", termFee: 4500, yearFee: 8500, children: 8 },
  { id: "f2", stage: "KG1", termFee: 5500, yearFee: 10500, children: 10 },
  { id: "f3", stage: "KG2", termFee: 6000, yearFee: 11500, children: 10 },
];

export type PaymentStatus = "paid" | "partial" | "due";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "مسددة",
  partial: "جزئية",
  due: "مستحقة",
};

export const paymentStatusTone: Record<PaymentStatus, Tone> = {
  paid: "green",
  partial: "yellow",
  due: "pink",
};

export interface PaymentRow {
  id: string;
  child: string;
  guardian: string;
  stage: string;
  amount: number;
  paid: number;
  status: PaymentStatus;
  receipt: string;
  date: string;
}

export const payments: PaymentRow[] = [
  { id: "p1", child: "ليان العتيبي", guardian: "أم ليان", stage: "KG1", amount: 10500, paid: 10500, status: "paid", receipt: "RC-1042", date: "٢٠ أغسطس" },
  { id: "p2", child: "عمر الشهري", guardian: "أبو عمر", stage: "KG1", amount: 10500, paid: 5500, status: "partial", receipt: "RC-1051", date: "٢٥ أغسطس" },
  { id: "p3", child: "فيصل العنزي", guardian: "أبو فيصل", stage: "KG2", amount: 11500, paid: 0, status: "due", receipt: "—", date: "—" },
  { id: "p4", child: "تالا الغامدي", guardian: "أم تالا", stage: "الحضانة", amount: 8500, paid: 8500, status: "paid", receipt: "RC-1033", date: "١٨ أغسطس" },
  { id: "p5", child: "مها السبيعي", guardian: "أم مها", stage: "KG2", amount: 11500, paid: 6000, status: "partial", receipt: "RC-1060", date: "٣٠ أغسطس" },
];

export const monthlyFinance = [
  { month: "يونيو", revenue: 38000, expenses: 21000 },
  { month: "يوليو", revenue: 42000, expenses: 24500 },
  { month: "أغسطس", revenue: 45000, expenses: 25000 },
  { month: "سبتمبر", revenue: 43000, expenses: 26000 },
];

export const ownerUpdates = [
  { id: "ou1", title: "اعتماد قيمة الأسبوع: الصدق", note: "نشرت الإدارة خطة القيمة وأنشطتها.", date: "١ سبتمبر", tone: "green" as Tone },
  { id: "ou2", title: "تحصيل ١٤٣٫٥ ألف ر.س", note: "٨٥٪ من الرسوم المستهدفة للفصل الأول.", date: "٣١ أغسطس", tone: "orange" as Tone },
  { id: "ou3", title: "اكتمال تسجيل ٢٨ طفلًا", note: "نسبة إشغال ٨٥٪ من الطاقة الاستيعابية.", date: "٢٨ أغسطس", tone: "blue" as Tone },
  { id: "ou4", title: "تقرير حضور المعلمات", note: "حالة تأخير واحدة وغياب واحد هذا الأسبوع.", date: "٢ سبتمبر", tone: "yellow" as Tone },
];

export function formatSAR(value: number) {
  return `${value.toLocaleString("ar-EG")} ر.س`;
}
