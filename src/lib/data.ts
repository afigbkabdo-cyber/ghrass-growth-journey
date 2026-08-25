/*
 * بيانات تجريبية واقعية لتطبيق غراس — المرحلة الأولى (UI/UX فقط).
 * كل الأسماء وهمية لأغراض العرض.
 */

export type Tone = "orange" | "blue" | "green" | "yellow" | "pink";

export type Stage = "nursery" | "kg1" | "kg2";

export const stageLabels: Record<Stage, string> = {
  nursery: "الحضانة",
  kg1: "KG1",
  kg2: "KG2",
};

export interface Child {
  id: string;
  name: string;
  stage: Stage;
  className: string;
  age: string;
  tone: Tone;
  guardian: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  subject?: string;
  tone: Tone;
}

export const currentChild: Child = {
  id: "c1",
  name: "ليان الحربي",
  stage: "kg1",
  className: "فصل البراعم",
  age: "٤ سنوات و٧ أشهر",
  tone: "pink",
  guardian: "أم ليان",
};

export const children: Child[] = [
  currentChild,
  { id: "c2", name: "عمر الشهري", stage: "kg1", className: "فصل البراعم", age: "٤ سنوات", tone: "blue", guardian: "أبو عمر" },
  { id: "c3", name: "جوري المطيري", stage: "kg1", className: "فصل البراعم", age: "٥ سنوات", tone: "yellow", guardian: "أم جوري" },
  { id: "c4", name: "فيصل العنزي", stage: "kg2", className: "فصل الأوراق", age: "٥ سنوات و٣ أشهر", tone: "green", guardian: "أبو فيصل" },
  { id: "c5", name: "سلمى القحطاني", stage: "kg2", className: "فصل الأوراق", age: "٥ سنوات", tone: "pink", guardian: "أم سلمى" },
  { id: "c6", name: "ريان الدوسري", stage: "nursery", className: "فصل البذور", age: "سنتان و٨ أشهر", tone: "orange", guardian: "أم ريان" },
  { id: "c7", name: "تالا الغامدي", stage: "nursery", className: "فصل البذور", age: "٣ سنوات", tone: "blue", guardian: "أم تالا" },
  { id: "c8", name: "يوسف الزهراني", stage: "kg1", className: "فصل البراعم", age: "٤ سنوات ونصف", tone: "green", guardian: "أبو يوسف" },
  { id: "c9", name: "مها السبيعي", stage: "kg2", className: "فصل الأوراق", age: "٥ سنوات و٨ أشهر", tone: "yellow", guardian: "أم مها" },
  { id: "c10", name: "آدم الحربي", stage: "nursery", className: "فصل البذور", age: "سنتان ونصف", tone: "pink", guardian: "أبو آدم" },
];

export const teachers: Teacher[] = [
  { id: "t1", name: "أ. نورة العتيبي", role: "معلمة اللغة العربية", subject: "العربي", tone: "orange" },
  { id: "t2", name: "أ. سارة القحطاني", role: "معلمة الرياضيات", subject: "الرياضيات", tone: "blue" },
  { id: "t3", name: "أ. ريم الشمري", role: "معلمة اللغة الإنجليزية", subject: "الإنجليزي", tone: "green" },
  { id: "t4", name: "أ. حصة الدوسري", role: "مشرفة الحضانة", subject: "الحضانة", tone: "pink" },
];

export const admins: Teacher[] = [
  { id: "a1", name: "أ. الجوهرة السبيعي", role: "مديرة الروضة", tone: "orange" },
  { id: "a2", name: "أ. منيرة العنزي", role: "المشرفة التربوية", tone: "blue" },
];

export interface ClassRoom {
  id: string;
  name: string;
  stage: Stage;
  teacher: string;
  students: number;
  capacity: number;
  tone: Tone;
}

export const classes: ClassRoom[] = [
  { id: "cl1", name: "فصل البذور", stage: "nursery", teacher: "أ. حصة الدوسري", students: 8, capacity: 10, tone: "pink" },
  { id: "cl2", name: "فصل البراعم", stage: "kg1", teacher: "أ. نورة العتيبي", students: 10, capacity: 12, tone: "orange" },
  { id: "cl3", name: "فصل الأوراق", stage: "kg2", teacher: "أ. سارة القحطاني", students: 10, capacity: 12, tone: "green" },
];

/* ---------- قيمة الأسبوع ---------- */

export interface WeekValue {
  id: string;
  name: string;
  tagline: string;
  hadith: string;
  source: string;
  authentication: string;
  explanation: string;
  learnings: string[];
  atSchool: string[];
  atHome: string[];
  challenge: string;
  weekStart: string;
  weekEnd: string;
  status: "draft" | "pending" | "approved" | "published";
  tone: Tone;
}

export const statusLabels: Record<WeekValue["status"], string> = {
  draft: "مسودة",
  pending: "بانتظار الاعتماد",
  approved: "معتمدة",
  published: "منشورة",
};

export const currentValue: WeekValue = {
  id: "v1",
  name: "الصدق",
  tagline: "أن أقول الحقيقة وأكون صادقًا في كلامي وأفعالي.",
  hadith:
    "قال رسول الله ﷺ: «عليكم بالصدق، فإن الصدق يهدي إلى البر، وإن البر يهدي إلى الجنة، وما يزال الرجل يصدق ويتحرى الصدق حتى يُكتب عند الله صدّيقًا».",
  source: "رواه مسلم",
  authentication: "حديث صحيح — موثق",
  explanation:
    "الصدق يعني أن أقول الحقيقة دائمًا، حتى لو أخطأت. عندما أكون صادقًا يحبني الله، ويثق بي أهلي ومعلماتي وأصدقائي.",
  learnings: [
    "أعرف معنى الصدق وأن الله يحب الصادقين.",
    "أفرّق بين قول الحقيقة والكذب في المواقف اليومية.",
    "أقول الحقيقة حتى عندما أخطئ، وأعتذر بشجاعة.",
  ],
  atSchool: [
    "قصة «الصادق الصغير» في حصة اللغة العربية مع حرف الصاد.",
    "بطاقات المواقف: ماذا تفعل لو كسرت لعبة صديقك؟",
    "نشاط جماعي: نزرع «شجرة الصدق» في ركن الفصل.",
  ],
  atHome: [
    "شجرة الصدق المنزلية: كل مرة يقول فيها طفلك الحقيقة أضيفوا ورقة خضراء.",
    "اقرؤوا معًا قصة قصيرة عن الصدق قبل النوم.",
    "امدح طفلك عندما يعترف بخطئه بدلًا من العقاب الفوري.",
  ],
  challenge: "اليوم حاول أن تقول الحقيقة حتى لو أخطأت.",
  weekStart: "الأحد ١٢ محرم ١٤٤٨هـ",
  weekEnd: "الخميس ١٦ محرم ١٤٤٨هـ",
  status: "published",
  tone: "orange",
};

export const allValues: WeekValue[] = [
  currentValue,
  {
    id: "v2",
    name: "الأمانة",
    tagline: "أحافظ على الأشياء التي تُعهد إليّ وأعيدها لأصحابها.",
    hadith: "قال رسول الله ﷺ: «أدِّ الأمانة إلى من ائتمنك، ولا تخن من خانك».",
    source: "رواه أبو داود والترمذي",
    authentication: "حديث حسن — موثق",
    explanation: "الأمانة تعني أن أحافظ على ألعابي وأدواتي وأدوات غيري، وأعيد كل شيء لصاحبه.",
    learnings: ["أعرف معنى الأمانة.", "أحافظ على مقتنيات الروضة.", "أعيد ما أستعيره."],
    atSchool: ["نشاط «صندوق الأمانة».", "قصة الأمين الصغير."],
    atHome: ["ترتيب الألعاب بعد اللعب.", "إعادة الأشياء المستعارة من الإخوة."],
    challenge: "أعد شيئًا استعرته هذا الأسبوع دون أن يطلب منك أحد.",
    weekStart: "الأحد ١٩ محرم ١٤٤٨هـ",
    weekEnd: "الخميس ٢٣ محرم ١٤٤٨هـ",
    status: "approved",
    tone: "blue",
  },
  {
    id: "v3",
    name: "الرحمة",
    tagline: "أكون لطيفًا مع أصدقائي والحيوانات وكل من حولي.",
    hadith: "قال رسول الله ﷺ: «الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء».",
    source: "رواه أبو داود والترمذي",
    authentication: "حديث صحيح — موثق",
    explanation: "الرحمة تعني قلبًا لطيفًا: أساعد من يحتاجني، وأكون رفيقًا بالحيوانات.",
    learnings: ["أعرف معنى الرحمة.", "أساعد صديقي عندما يحزن.", "أكون لطيفًا مع الحيوانات."],
    atSchool: ["نشاط «يد المساعدة».", "قصة القطة والرجل الصالح."],
    atHome: ["سقي نبتة أو إطعام طائر مع الأسرة."],
    challenge: "افعل اليوم شيئًا لطيفًا لشخص دون أن يطلب منك.",
    weekStart: "الأحد ٢٦ محرم ١٤٤٨هـ",
    weekEnd: "الخميس ٣٠ محرم ١٤٤٨هـ",
    status: "pending",
    tone: "pink",
  },
  {
    id: "v4",
    name: "التعاون",
    tagline: "نعمل معًا ونساعد بعضنا لننجز أجمل الأشياء.",
    hadith: "قال الله تعالى: ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾.",
    source: "سورة المائدة — آية ٢",
    authentication: "آية قرآنية",
    explanation: "التعاون يعني أن نلعب ونعمل معًا، فاليد الواحدة لا تصفق!",
    learnings: ["ألعب مع أصدقائي بروح الفريق.", "أساعد في ترتيب الفصل."],
    atSchool: ["بناء برج جماعي بالمكعبات."],
    atHome: ["المساعدة في ترتيب طاولة الطعام."],
    challenge: "ساعد أحد أفراد أسرتك في مهمة منزلية اليوم.",
    weekStart: "الأحد ٣ صفر ١٤٤٨هـ",
    weekEnd: "الخميس ٧ صفر ١٤٤٨هـ",
    status: "draft",
    tone: "green",
  },
];

/* ---------- رحلة غراس ---------- */

export interface JourneyStop {
  id: string;
  value: string;
  week: string;
  state: "done" | "current" | "upcoming";
  growth: "seed" | "sprout" | "tree";
  tone: Tone;
}

export const journeyStops: JourneyStop[] = [
  { id: "j1", value: "النظافة", week: "الأسبوع ١", state: "done", growth: "seed", tone: "blue" },
  { id: "j2", value: "الاحترام", week: "الأسبوع ٢", state: "done", growth: "seed", tone: "yellow" },
  { id: "j3", value: "الشكر", week: "الأسبوع ٣", state: "done", growth: "sprout", tone: "pink" },
  { id: "j4", value: "الصبر", week: "الأسبوع ٤", state: "done", growth: "sprout", tone: "green" },
  { id: "j5", value: "الصدق", week: "الأسبوع ٥", state: "current", growth: "sprout", tone: "orange" },
  { id: "j6", value: "الأمانة", week: "الأسبوع ٦", state: "upcoming", growth: "tree", tone: "blue" },
  { id: "j7", value: "الرحمة", week: "الأسبوع ٧", state: "upcoming", growth: "tree", tone: "pink" },
  { id: "j8", value: "التعاون", week: "الأسبوع ٨", state: "upcoming", growth: "tree", tone: "green" },
];

/* ---------- الأنشطة ---------- */

export interface Activity {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  description: string;
  skill: string;
  value: string;
  date: string;
  hasPhotos: boolean;
  tone: Tone;
}

export const todayActivities: Activity[] = [
  {
    id: "ac1",
    title: "حرف الصاد مع قصة «الصادق الصغير»",
    subject: "اللغة العربية",
    teacher: "أ. نورة العتيبي",
    description: "تعرّف الأطفال على حرف الصاد من خلال قصة تفاعلية عن الصدق، ثم لوّنوا بطاقة الحرف وربطوه بكلمات: صدق، صباح، صديق.",
    skill: "التمييز الصوتي والإدراك البصري للحرف",
    value: "الصدق",
    date: "اليوم",
    hasPhotos: true,
    tone: "orange",
  },
  {
    id: "ac2",
    title: "نعدّ أوراق الشجر حتى ٥",
    subject: "الرياضيات",
    teacher: "أ. سارة القحطاني",
    description: "نشاط حسّي بأوراق الشجر المجففة: عدّ، مطابقة العدد بالرقم، وترتيب من الأقل إلى الأكثر.",
    skill: "العد والمطابقة عدد/رقم حتى ٥",
    value: "الصدق",
    date: "اليوم",
    hasPhotos: false,
    tone: "blue",
  },
  {
    id: "ac3",
    title: "كلمة Honesty وأغنية الصدق",
    subject: "اللغة الإنجليزية",
    teacher: "أ. ريم الشمري",
    description: "تعلم كلمة Honesty مع أغنية قصيرة وحركات، وربط الكلمة بمواقف بسيطة من يوم الطفل.",
    skill: "مفردات جديدة والاستماع",
    value: "الصدق",
    date: "اليوم",
    hasPhotos: true,
    tone: "green",
  },
  {
    id: "ac4",
    title: "شجرة الصدق التفاعلية",
    subject: "النشاط والقيم",
    teacher: "جميع المعلمات",
    description: "كل طفل كتب (برسمة) موقفًا كان فيه صادقًا على ورقة خضراء وأضافها إلى شجرة الفصل.",
    skill: "التعبير والمشاركة الجماعية",
    value: "الصدق",
    date: "اليوم",
    hasPhotos: true,
    tone: "pink",
  },
];

/* ---------- الحضور ---------- */

export type AttendanceStatus = "present" | "absent" | "late";

export const attendanceLabels: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
};

export interface AttendanceDay {
  date: string;
  hijri?: string;
  status: AttendanceStatus;
  time?: string;
}

export const childAttendance: AttendanceDay[] = [
  { date: "اليوم — الأحد", status: "present", time: "٧:٤٢ ص" },
  { date: "الخميس الماضي", status: "present", time: "٧:٣٨ ص" },
  { date: "الأربعاء", status: "late", time: "٨:١٥ ص" },
  { date: "الثلاثاء", status: "present", time: "٧:٣٥ ص" },
  { date: "الاثنين", status: "present", time: "٧:٤٠ ص" },
  { date: "الأحد الماضي", status: "absent" },
];

export interface ClassAttendanceRow {
  childId: string;
  status: AttendanceStatus;
  time?: string;
}

export const todayClassAttendance: ClassAttendanceRow[] = [
  { childId: "c1", status: "present", time: "٧:٤٢ ص" },
  { childId: "c2", status: "present", time: "٧:٣٠ ص" },
  { childId: "c3", status: "late", time: "٨:١٠ ص" },
  { childId: "c8", status: "absent" },
];

/* ---------- الرسائل ---------- */

export interface Conversation {
  id: string;
  with: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  tone: Tone;
}

export const conversations: Conversation[] = [
  {
    id: "m1",
    with: "أ. نورة العتيبي",
    role: "معلمة اللغة العربية",
    lastMessage: "ليان شاركت اليوم بقصة الصدق أمام زملائها، أحسنت 🌱",
    time: "قبل ساعتين",
    unread: 1,
    tone: "orange",
  },
  {
    id: "m2",
    with: "إدارة الروضة",
    role: "أخبار وتنبيهات",
    lastMessage: "تذكير: اجتماع أولياء الأمور الخميس القادم.",
    time: "أمس",
    unread: 0,
    tone: "blue",
  },
];

export interface ChatMessage {
  id: string;
  from: "parent" | "school";
  text: string;
  time: string;
}

export const chatThread: ChatMessage[] = [
  { id: "mm1", from: "school", text: "صباح الخير أم ليان 🌱 أحببت أن أشاركك أن ليان كانت متفاعلة جدًا اليوم في حصة القصة.", time: "١٠:١٥ ص" },
  { id: "mm2", from: "parent", text: "صباح النور أستاذة نورة، الحمد لله! هل شاركت في النشاط الجماعي أيضًا؟", time: "١٠:٤٠ ص" },
  { id: "mm3", from: "school", text: "نعم، أضافت ورقتها إلى شجرة الصدق وقالت للزملاء: «الصدق يجعل قلبي قويًا» 😊", time: "١١:٠٥ ص" },
  { id: "mm4", from: "school", text: "ليان شاركت اليوم بقصة الصدق أمام زملائها، أحسنت 🌱", time: "١٢:٣٠ م" },
];

/* ---------- الإعلانات ---------- */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  kind: "event" | "reminder" | "news";
  tone: Tone;
}

export const kindLabels: Record<Announcement["kind"], string> = {
  event: "فعالية",
  reminder: "تنبيه",
  news: "خبر",
};

export const announcements: Announcement[] = [
  {
    id: "an1",
    title: "اجتماع أولياء الأمور الأول",
    body: "يسعدنا دعوتكم لاجتماع تعريفي الخميس القادم الساعة ٥ مساءً للتعرف على منهج غراس القيمي وخطة العام.",
    date: "الخميس القادم — ٥:٠٠ م",
    kind: "event",
    tone: "blue",
  },
  {
    id: "an2",
    title: "فعالية «أسبوع الشجرة»",
    body: "سيزرع كل طفل بذرته الخاصة في حديقة الروضة، وسيتابع نموها طوال العام ضمن رحلة غراس.",
    date: "الأسبوع القادم",
    kind: "event",
    tone: "green",
  },
  {
    id: "an3",
    title: "تذكير: ملابس احتياطية",
    body: "نرجو إرسال طقم ملابس احتياطي مع الطفل يوميًا في حقيبته.",
    date: "تنبيه دائم",
    kind: "reminder",
    tone: "yellow",
  },
  {
    id: "an4",
    title: "انطلاق قيمة الأسبوع: الصدق",
    body: "بدأنا هذا الأسبوع رحلة جديدة مع قيمة الصدق. تابعوا أنشطة أطفالكم وتحدي غراس المنزلي من التطبيق.",
    date: "اليوم",
    kind: "news",
    tone: "orange",
  },
];

/* ---------- ملاحظات المعلمات ---------- */

export interface TeacherNote {
  id: string;
  teacher: string;
  text: string;
  date: string;
  tone: Tone;
}

export const childNotes: TeacherNote[] = [
  { id: "n1", teacher: "أ. نورة العتيبي", text: "ليان شاركت اليوم بقصة الصدق أمام زملائها بثقة جميلة، أحسنت 🌱", date: "اليوم", tone: "orange" },
  { id: "n2", teacher: "أ. سارة القحطاني", text: "تحسّن واضح في العد حتى ٥، أنصح بتكرار النشاط المنزلي.", date: "الخميس الماضي", tone: "blue" },
  { id: "n3", teacher: "أ. ريم الشمري", text: "Layan loved the Honesty song today and repeated the words happily!", date: "الثلاثاء", tone: "green" },
];

/* ---------- إحصاءات الإدارة ---------- */

export const adminStats = {
  totalChildren: 28,
  presentToday: 24,
  absentToday: 3,
  lateToday: 1,
  teachersCount: 4,
  classesCount: 3,
  activitiesToday: 4,
  unreadMessages: 6,
};

/* ---------- الموافقات والخصوصية ---------- */

export interface Consent {
  id: string;
  title: string;
  description: string;
  granted: boolean;
  required: boolean;
}

export const consents: Consent[] = [
  {
    id: "co1",
    title: "معالجة البيانات الأساسية للطفل",
    description: "الاسم، العمر، المرحلة، وسجلات الحضور — لازمة لتقديم الخدمة التعليمية.",
    granted: true,
    required: true,
  },
  {
    id: "co2",
    title: "صور الطفل داخل الأنشطة",
    description: "السماح للمعلمات بمشاركة صور طفلك ضمن أنشطة الفصل داخل التطبيق فقط.",
    granted: true,
    required: false,
  },
  {
    id: "co3",
    title: "مقاطع الفيديو القصيرة",
    description: "السماح بمشاركة مقاطع فيديو قصيرة لطفلك أثناء الأنشطة والفعاليات.",
    granted: false,
    required: false,
  },
  {
    id: "co4",
    title: "مشاركة الأنشطة في أخبار الروضة",
    description: "السماح بظهور أعمال طفلك (دون صور شخصية) في إعلانات وأخبار الروضة.",
    granted: true,
    required: false,
  },
];
