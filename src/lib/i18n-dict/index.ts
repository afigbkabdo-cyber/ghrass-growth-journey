/*
 * دمج قواميس الترجمة في قاموس واحد. المفتاح هو النص العربي.
 * كل ملف يغطي مجموعة شاشات لتسهيل الصيانة.
 */
import { common } from "./common";
import { auth } from "./auth";
import { parent } from "./parent";
import { teacher } from "./teacher";
import { admin } from "./admin";
import { values } from "./values";
import { children } from "./children";
import { classes } from "./classes";
import { settings } from "./settings";
import { messages } from "./messages";
import { activities } from "./activities";
import { teacherExtra } from "./teacher-extra";
import { dashboard } from "./dashboard";

export const dictionaryEn: Record<string, string> = {
  'الإشعارات داخل التطبيق': 'In-app notifications',
  'تعذر تحميل الإشعارات': 'Unable to load notifications',
  'تعذر تحديد الإشعار كمقروء': 'Unable to mark notification as read',
  'تحديث الإشعارات': 'Refresh notifications',
  'لا توجد تحديثات جديدة مسجلة.': 'No new updates recorded.',
  'فتح الإشعار': 'Open notification',
  'تحديد كمقروء': 'Mark as read',
  'غير مقروء': 'Unread',
  ...common,
  ...auth,
  ...parent,
  ...teacher,
  ...admin,
  ...values,
  ...children,
  ...classes,
  ...settings,
  ...messages,
  ...activities,
  ...teacherExtra,
  ...dashboard,
};
