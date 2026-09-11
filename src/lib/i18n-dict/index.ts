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

export const dictionaryEn: Record<string, string> = {
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
};
