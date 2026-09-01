import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Blocks,
  Megaphone,
  MessageCircleHeart,
  ChevronLeft,
  CalendarCheck,
  Trophy,
  BookOpenText,
  House,
  ImageIcon,
} from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import {
  Avatar,
  PageContainer,
  SectionHeader,
  ToneBadge,
  toneClasses,
} from "@/components/ghiras";
import {
  announcements,
  childAttendance,
  conversations,
  currentChild,
  currentValue,
  todayActivities,
} from "@/lib/data";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — غراس | نمو معًا" },
      {
        name: "description",
        content:
          "تابع قيمة الأسبوع وأنشطة طفلك اليومية ورسائل المعلمات في تطبيق روضة غراس.",
      },
      { property: "og:title", content: "الرئيسية — غراس | نمو معًا" },
      {
        property: "og:description",
        content: "القيمة ← الحديث ← التعلم ← النشاط ← البيت ← نمو الطفل.",
      },
    ],
  }),
  component: ParentHome,
});

function ParentHome() {
  const today = childAttendance[0];
  const t = toneClasses[currentValue.tone];

  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        {/* ترحيب */}
        <section className="mb-5 flex items-center gap-3">
          <Avatar name={currentChild.name} tone={currentChild.tone} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">صباح النور، {currentChild.guardian} 🌱</p>
            <h1 className="font-display text-xl font-extrabold text-foreground">
              يوم {currentChild.name.split(" ")[0]} في غراس
            </h1>
          </div>
          <ToneBadge tone="green">
            <CalendarCheck className="h-3.5 w-3.5" />
            حاضرة {today.time}
          </ToneBadge>
        </section>

        {/* بطاقة قيمة الأسبوع — قلب التجربة */}
        <Link to="/value" className="group mb-6 block">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-growth p-5 shadow-soft">
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/15" />
            <div className="absolute -bottom-10 left-16 h-24 w-24 rounded-full bg-primary-foreground/10" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-[11px] font-bold text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  قيمة الأسبوع
                </span>
                <span className="text-[11px] font-medium text-primary-foreground/85">{currentValue.weekStart}</span>
              </div>
              <h2 className="font-display text-3xl font-extrabold text-primary-foreground">{currentValue.name}</h2>
              <p className="mt-1 text-sm font-medium leading-relaxed text-primary-foreground/90">
                {currentValue.tagline}
              </p>
              <p className="mt-3 rounded-2xl bg-primary-foreground/15 p-3 text-xs leading-relaxed text-primary-foreground">
                {currentValue.hadith}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-foreground transition-transform group-hover:-translate-x-1">
                اكتشف الرحلة كاملة
                <ChevronLeft className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>

        {/* تحدي غراس المنزلي */}
        <section className="mb-6 rounded-3xl border border-brand-yellow/40 bg-brand-yellow-soft p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card shadow-soft">
              <Trophy className="h-5.5 w-5.5 text-brand-yellow-deep" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-brand-yellow-deep">تحدي غراس المنزلي</p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">{currentValue.challenge}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <ToneBadge tone="yellow">
                  <House className="h-3.5 w-3.5" />
                  نشاط منزلي
                </ToneBadge>
                <span className="text-[11px] font-medium text-muted-foreground">شاركينا النتيجة مع المعلمة</span>
              </div>
            </div>
          </div>
        </section>

        {/* أنشطة اليوم */}
        <SectionHeader
          title="أنشطة اليوم"
          subtitle={`${todayActivities.length} أنشطة مرتبطة بقيمة ${currentValue.name}`}
          icon={Blocks}
          tone="blue"
          action={{ label: "كل الأنشطة", to: "/activities" }}
        />
        <div className="mb-6 space-y-3">
          {todayActivities.slice(0, 3).map((a) => {
            const at = toneClasses[a.tone];
            return (
              <article
                key={a.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${at.soft}`}>
                    <BookOpenText className={`h-5 w-5 ${at.deep}`} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug text-foreground">{a.title}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {a.subject} • {a.teacher}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <ToneBadge tone={a.tone}>{a.value}</ToneBadge>
                      {a.hasPhotos && (
                        <ToneBadge tone="pink">
                          <ImageIcon className="h-3 w-3" />
                          صور
                        </ToneBadge>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* آخر الرسائل */}
        <SectionHeader
          title="رسائل المعلمات"
          icon={MessageCircleHeart}
          tone="pink"
          action={{ label: "كل الرسائل", to: "/messages" }}
        />
        <div className="mb-6 space-y-3">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to="/chat"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
            >
              <Avatar name={c.with} tone={c.tone} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-foreground">{c.with}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-pink text-[10px] font-extrabold text-primary-foreground">
                  {c.unread}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* الإعلانات */}
        <SectionHeader
          title="أخبار الروضة"
          icon={Megaphone}
          tone="green"
          action={{ label: "كل الإعلانات", to: "/announcements" }}
        />
        <div className="space-y-3">
          {announcements.slice(0, 2).map((an) => (
            <article key={an.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">{an.title}</h3>
                <ToneBadge tone={an.tone}>{an.date}</ToneBadge>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{an.body}</p>
            </article>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
