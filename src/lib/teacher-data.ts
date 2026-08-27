/*
 * بيانات تجريبية لواجهة المعلمة — المرحلة الثانية (UI/UX فقط، لا قاعدة بيانات).
 * كل الأسماء وهمية لأغراض العرض فقط.
 */

import type { Tone, AttendanceStatus } from "@/lib/data";

export type Subject = "arabic" | "math" | "english" | "nursery";

export const subjectLabels: Record<Subject, string> = {
  arabic: "اللغة العربية",
  math: "الرياضيات",
  english: "اللغة الإنجليزية",
  nursery: "الحضانة والقيم",
};

export interface TeacherProfile {
  id: string;
  name: string;
  subject: Subject;
  className: string;
  stageLabel: string;
  email: string;
  tone: Tone;
}

/* المعلمة الحالية (مستخدم تجريبي) */
export const currentTeacher: TeacherProfile = {
  id: "t1",
  name: "أ. نورة العتيبي",
  subject: "arabic",
  className: "فصل النجوم",
  stageLabel: "KG1",
  email: "noura@ghiras.sa",
  tone: "orange",
};

export const teacherClassTitle = `${currentTeacher.stageLabel} — ${currentTeacher.className}`;

/* ---------- أطفال فصل المعلمة (١٠ أطفال) ---------- */

export interface TeacherChild {
  id: string;
  name: string;
  guardian: string;
  age: string;
  tone: Tone;
  attendance: AttendanceStatus;
  arriveTime?: string;
  attendanceRate: number;
  lastNote: string;
  lastNoteDate: string;
}

export const teacherChildren: TeacherChild[] = [
  {
    id: "tc1",
    name: "ليان أحمد",
    guardian: "أم ليان",
    age: "٤ سنوات و٧ أشهر",
    tone: "pink",
    attendance: "present",
    arriveTime: "٧:٤٢ ص",
    attendanceRate: 96,
    lastNote: "شاركت بقصة الصدق أمام زملائها بثقة جميلة.",
    lastNoteDate: "اليوم",
  },
  {
    id: "tc2",
    name: "محمد أحمد",
    guardian: "أبو محمد",
    age: "٤ سنوات و٣ أشهر",
    tone: "blue",
    attendance: "present",
    arriveTime: "٧:٣٠ ص",
    attendanceRate: 92,
    lastNote: "تحسّن ملحوظ في نطق حرف الصاد.",
    lastNoteDate: "أمس",
  },
  {
    id: "tc3",
    name: "سارة علي",
    guardian: "أم سارة",
    age: "٤ سنوات و٥ أشهر",
    tone: "yellow",
    attendance: "absent",
    attendanceRate: 84,
    lastNote: "تحتاج تشجيعًا للمشاركة في الأنشطة الجماعية.",
    lastNoteDate: "الخميس الماضي",
  },
  {
    id: "tc4",
    name: "خالد سعد",
    guardian: "أبو خالد",
    age: "٤ سنوات",
    tone: "green",
    attendance: "present",
    arriveTime: "٧:٣٥ ص",
    attendanceRate: 90,
    lastNote: "ساعد زميله في ترتيب أدوات النشاط.",
    lastNoteDate: "اليوم",
  },
  {
    id: "tc5",
    name: "جوري ماجد",
    guardian: "أم جوري",
    age: "٤ سنوات و٨ أشهر",
    tone: "orange",
    attendance: "present",
    arriveTime: "٧:٤٥ ص",
    attendanceRate: 98,
    lastNote: "أتمّت بطاقة حرف الصاد بدقة عالية.",
    lastNoteDate: "أمس",
  },
  {
    id: "tc6",
    name: "عبدالله فهد",
    guardian: "أبو عبدالله",
    age: "٤ سنوات و٢ أشهر",
    tone: "blue",
    attendance: "present",
    arriveTime: "٧:٥٠ ص",
    attendanceRate: 88,
    lastNote: "يحتاج متابعة في الجلوس أثناء وقت القصة.",
    lastNoteDate: "الثلاثاء",
  },
  {
    id: "tc7",
    name: "ريما ناصر",
    guardian: "أم ريما",
    age: "٤ سنوات و٦ أشهر",
    tone: "pink",
    attendance: "present",
    arriveTime: "٧:٣٨ ص",
    attendanceRate: 94,
    lastNote: "عبّرت عن موقف صادق من بيتها أمام الفصل.",
    lastNoteDate: "اليوم",
  },
  {
    id: "tc8",
    name: "يوسف تركي",
    guardian: "أبو يوسف",
    age: "٤ سنوات و٤ أشهر",
    tone: "green",
    attendance: "present",
    arriveTime: "٧:٤٠ ص",
    attendanceRate: 91,
    lastNote: "مبادر جدًا في الإجابة على أسئلة النقاش.",
    lastNoteDate: "أمس",
  },
  {
    id: "tc9",
    name: "دانة عمر",
    guardian: "أم دانة",
    age: "٤ سنوات و٩ أشهر",
    tone: "yellow",
    attendance: "present",
    arriveTime: "٧:٣٢ ص",
    attendanceRate: 97,
    lastNote: "تساعد المعلمة في توزيع البطاقات بحماس.",
    lastNoteDate: "اليوم",
  },
  {
    id: "tc10",
    name: "سلمان بدر",
    guardian: "أبو سلمان",
    age: "٤ سنوات و١ شهر",
    tone: "orange",
    attendance: "present",
    arriveTime: "٧:٤٨ ص",
    attendanceRate: 86,
    lastNote: "تفاعل جيد مع أغنية القيم الأسبوعية.",
    lastNoteDate: "الاثنين",
  },
];

/* ---------- ملخص اليوم ---------- */

export const teacherTodaySummary = {
  children: teacherChildren.length,
  present: teacherChildren.filter((c) => c.attendance === "present").length,
  absent: teacherChildren.filter((c) => c.attendance === "absent").length,
  late: teacherChildren.filter((c) => c.attendance === "late").length,
  activities: 4,
};

/* ---------- أنشطة المعلمة ---------- */

export type ActivityState = "draft" | "published";

export const activityStateLabels: Record<ActivityState, string> = {
  draft: "مسودة",
  published: "منشور",
};

export interface TeacherActivity {
  id: string;
  emoji: string;
  title: string;
  subject: Subject;
  value: string;
  teacher: string;
  description: string;
  skill: string;
  state: ActivityState;
  visibleToParents: boolean;
  photos: number;
  tone: Tone;
}

export const teacherActivities: TeacherActivity[] = [
  {
    id: "ta1",
    emoji: "📖",
    title: "قصة الصادق الصغير",
    subject: "arabic",
    value: "الصدق",
    teacher: currentTeacher.name,
    description:
      "قصة تفاعلية عن طفل قال الحقيقة بعد أن كسر مزهرية، ثم نقاش جماعي: كيف شعر؟ وماذا فعلت أمه؟",
    skill: "الاستماع والفهم والتعبير الشفهي",
    state: "published",
    visibleToParents: true,
    photos: 3,
    tone: "orange",
  },
  {
    id: "ta2",
    emoji: "✍️",
    title: "حرف الصاد — صدق، صباح، صديق",
    subject: "arabic",
    value: "الصدق",
    teacher: currentTeacher.name,
    description: "تمييز صوت الصاد في بداية الكلمة، وتلوين بطاقة الحرف مع ربطها بكلمات القيمة.",
    skill: "الوعي الصوتي والتمييز البصري للحرف",
    state: "published",
    visibleToParents: true,
    photos: 2,
    tone: "yellow",
  },
  {
    id: "ta3",
    emoji: "🌳",
    title: "شجرة الصدق في ركن الفصل",
    subject: "arabic",
    value: "الصدق",
    teacher: currentTeacher.name,
    description: "كل طفل يرسم موقفًا كان فيه صادقًا على ورقة خضراء ويضيفها إلى شجرة الفصل.",
    skill: "التعبير الفني والمشاركة الجماعية",
    state: "published",
    visibleToParents: true,
    photos: 5,
    tone: "green",
  },
  {
    id: "ta4",
    emoji: "🎭",
    title: "بطاقات المواقف: ماذا أفعل؟",
    subject: "arabic",
    value: "الصدق",
    teacher: currentTeacher.name,
    description: "تمثيل مواقف يومية بسيطة يختار فيها الطفل بين الصدق والكذب مع تبرير الاختيار.",
    skill: "التفكير الأخلاقي وحل المشكلات",
    state: "draft",
    visibleToParents: false,
    photos: 0,
    tone: "blue",
  },
];

/* أنشطة المواد الأخرى — مرتبطة بنفس القيمة (للعرض فقط، غير قابلة للتعديل) */
export const otherSubjectActivities: { subject: Subject; title: string; tone: Tone }[] = [
  { subject: "math", title: "نعدّ أوراق الشجرة حتى ٥", tone: "blue" },
  { subject: "english", title: "Honesty — أغنية ومفردة الأسبوع", tone: "green" },
  { subject: "nursery", title: "أغنية «أقول الحقيقة»", tone: "pink" },
];

/* ---------- دليل قيمة الأسبوع (معتمد من الإدارة) ---------- */

export const teacherValueGuide = {
  name: "الصدق",
  tagline: "أن أقول الحقيقة وأكون صادقًا في كلامي وأفعالي.",
  hadith:
    "قال رسول الله ﷺ: «عليكم بالصدق، فإن الصدق يهدي إلى البر، وإن البر يهدي إلى الجنة».",
  source: "رواه مسلم — معتمد من إدارة غراس",
  week: "الأسبوع ٥ — من الأحد ١٢ محرم إلى الخميس ١٦ محرم ١٤٤٨هـ",
  goals: [
    "أن يفهم الطفل معنى الصدق.",
    "أن يميز بين الصدق والكذب.",
    "أن يمارس الصدق في المواقف اليومية.",
  ],
  ideas: [
    { emoji: "📖", title: "قصة قصيرة", detail: "«الصادق الصغير» مع أسئلة فهم بسيطة بعد القصة." },
    { emoji: "🎲", title: "لعبة جماعية", detail: "دائرة الصدق: كل طفل يذكر موقفًا قال فيه الحقيقة." },
    { emoji: "💬", title: "سؤال للنقاش", detail: "ماذا تفعل لو كسرت لعبة صديقك دون أن يراك أحد؟" },
    { emoji: "🎨", title: "نشاط فني", detail: "ورقة خضراء لشجرة الصدق يرسم فيها الطفل موقفه." },
    { emoji: "🏠", title: "نشاط منزلي", detail: "شجرة الصدق المنزلية مع الأسرة خلال الأسبوع." },
  ],
};

/* ---------- الملاحظات ---------- */

export const noteDomains = [
  "المشاركة",
  "التواصل",
  "السلوك",
  "المهارات الاجتماعية",
  "التعلم",
  "ملاحظة عامة",
] as const;

export type NoteDomain = (typeof noteDomains)[number];

export interface ChildNote {
  id: string;
  childId: string;
  domain: NoteDomain;
  text: string;
  date: string;
  sharedWithParent: boolean;
}

export const childNotesLog: ChildNote[] = [
  {
    id: "cn1",
    childId: "tc1",
    domain: "المشاركة",
    text: "شاركت ليان اليوم بشكل رائع في نشاط الصدق وتعاونت مع زملائها.",
    date: "اليوم — ١٠:٢٠ ص",
    sharedWithParent: true,
  },
  {
    id: "cn2",
    childId: "tc1",
    domain: "التعلم",
    text: "تميّز حرف الصاد بشكل صحيح في ٥ كلمات من ٦.",
    date: "أمس",
    sharedWithParent: true,
  },
  {
    id: "cn3",
    childId: "tc1",
    domain: "المهارات الاجتماعية",
    text: "أخذت دورها في الحديث دون مقاطعة زميلاتها.",
    date: "الثلاثاء",
    sharedWithParent: false,
  },
  {
    id: "cn4",
    childId: "tc2",
    domain: "التعلم",
    text: "تحسّن واضح في نطق حرف الصاد بعد التدريب الفردي.",
    date: "أمس",
    sharedWithParent: true,
  },
];

/* ---------- مؤشرات التطور ---------- */

export interface DevIndicator {
  label: string;
  value: number;
  tone: Tone;
}

export const devIndicators: DevIndicator[] = [
  { label: "اللغة والتعبير", value: 82, tone: "orange" },
  { label: "المهارات الاجتماعية", value: 90, tone: "green" },
  { label: "الاستقلالية", value: 74, tone: "blue" },
  { label: "ممارسة القيم", value: 88, tone: "pink" },
];

/* ---------- القيم التي تعلمها الطفل ---------- */

export const learnedValues = [
  { name: "النظافة", tone: "blue" as Tone },
  { name: "الاحترام", tone: "yellow" as Tone },
  { name: "الشكر", tone: "pink" as Tone },
  { name: "الصبر", tone: "green" as Tone },
  { name: "الصدق", tone: "orange" as Tone },
];

/* ---------- رسائل المعلمة ---------- */

export interface TeacherConversation {
  id: string;
  childName: string;
  guardian: string;
  lastMessage: string;
  time: string;
  unread: number;
  tone: Tone;
  kind: "parent" | "admin";
}

export const teacherConversations: TeacherConversation[] = [
  {
    id: "tm1",
    childName: "ليان أحمد",
    guardian: "أم ليان",
    lastMessage: "وعليكم السلام، شكرًا لكم.",
    time: "قبل ١٠ دقائق",
    unread: 1,
    tone: "pink",
    kind: "parent",
  },
  {
    id: "tm2",
    childName: "محمد أحمد",
    guardian: "أبو محمد",
    lastMessage: "هل يحتاج محمد تدريبًا إضافيًا على الحرف في البيت؟",
    time: "قبل ساعة",
    unread: 2,
    tone: "blue",
    kind: "parent",
  },
  {
    id: "tm3",
    childName: "إدارة غراس",
    guardian: "أ. الجوهرة السبيعي",
    lastMessage: "تم اعتماد قيمة الأسبوع القادم: الأمانة.",
    time: "أمس",
    unread: 0,
    tone: "orange",
    kind: "admin",
  },
];

export interface TeacherChatMessage {
  id: string;
  from: "teacher" | "other";
  text: string;
  time: string;
}

export const teacherThreads: Record<string, TeacherChatMessage[]> = {
  tm1: [
    {
      id: "a1",
      from: "teacher",
      text: "السلام عليكم، أحببت أن أخبركم أن ليان شاركت اليوم بشكل رائع في النشاط.",
      time: "١٠:٢٥ ص",
    },
    { id: "a2", from: "other", text: "وعليكم السلام، شكرًا لكم.", time: "١٠:٣٥ ص" },
  ],
  tm2: [
    {
      id: "b1",
      from: "teacher",
      text: "صباح الخير، محمد تحسّن كثيرًا في نطق حرف الصاد اليوم 🌱",
      time: "٩:٤٠ ص",
    },
    {
      id: "b2",
      from: "other",
      text: "هل يحتاج محمد تدريبًا إضافيًا على الحرف في البيت؟",
      time: "٩:٥٥ ص",
    },
  ],
  tm3: [
    {
      id: "c1",
      from: "other",
      text: "تم اعتماد قيمة الأسبوع القادم: الأمانة. سيتم نشر الدليل يوم الخميس.",
      time: "أمس ٤:٠٠ م",
    },
  ],
};

/* ---------- إعلانات الإدارة (قراءة فقط) ---------- */

export interface TeacherAnnouncement {
  id: string;
  title: string;
  body: string;
  date: string;
  from: string;
  tone: Tone;
}

export const teacherAnnouncements: TeacherAnnouncement[] = [
  {
    id: "tan1",
    title: "اجتماع المعلمات الأسبوعي",
    body: "اجتماع تحضيري لقيمة الأسبوع القادم (الأمانة) يوم الأربعاء الساعة ١:٣٠ م في غرفة المعلمات.",
    date: "الأربعاء — ١:٣٠ م",
    from: "إدارة غراس",
    tone: "blue",
  },
  {
    id: "tan2",
    title: "نشر قيمة الأسبوع: الصدق",
    body: "تم نشر دليل قيمة الصدق لجميع المعلمات. يُرجى ربط أنشطة الأسبوع بالقيمة.",
    date: "الأحد",
    from: "المشرفة التربوية",
    tone: "orange",
  },
  {
    id: "tan3",
    title: "فعالية أسبوع الشجرة",
    body: "سيزرع كل طفل بذرته في حديقة الروضة الأسبوع القادم. يُرجى تجهيز قائمة أطفال الفصل.",
    date: "الأسبوع القادم",
    from: "إدارة غراس",
    tone: "green",
  },
];

/* ---------- الإشعارات ---------- */

export interface TeacherNotification {
  id: string;
  emoji: string;
  text: string;
  time: string;
  unread: boolean;
  tone: Tone;
}

export const teacherNotifications: TeacherNotification[] = [
  { id: "tn1", emoji: "🌱", text: "تم نشر قيمة الأسبوع الجديدة: الصدق.", time: "قبل ساعتين", unread: true, tone: "orange" },
  { id: "tn2", emoji: "💌", text: "لديك رسالة جديدة من ولي أمر محمد أحمد.", time: "قبل ساعة", unread: true, tone: "blue" },
  { id: "tn3", emoji: "🔴", text: "تم تسجيل غياب سارة علي اليوم.", time: "٨:٠٥ ص", unread: false, tone: "pink" },
  { id: "tn4", emoji: "📢", text: "إعلان جديد من الإدارة: اجتماع المعلمات الأسبوعي.", time: "أمس", unread: false, tone: "green" },
];

/* ---------- صلاحيات المعلمة (للعرض في UX) ---------- */

export const teacherPermissions = {
  allowed: [
    "رؤية أطفال فصلي فقط",
    "تسجيل الحضور اليومي",
    "إضافة أنشطة ونشرها",
    "إضافة ملاحظات الأطفال",
    "مراسلة أولياء أمور أطفالي والإدارة",
    "الاطلاع على قيمة الأسبوع وإعلانات الإدارة",
  ],
  denied: [
    "إدارة المستخدمين والمعلمات",
    "إضافة أو حذف الأطفال والفصول",
    "تعديل قيمة الأسبوع أو الحديث ومصدره",
    "رؤية بيانات أطفال فصول أخرى",
    "الإدارة المالية وإعدادات النظام",
  ],
};
