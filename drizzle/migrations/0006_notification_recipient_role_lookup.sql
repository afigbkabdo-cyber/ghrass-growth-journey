CREATE OR REPLACE FUNCTION public.notify_parent_child_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE kind text; heading text; heading_en text; content text; content_en text; cid uuid; recipient uuid; day date;
BEGIN
 IF TG_TABLE_NAME='child_attendance' THEN
  IF NEW.check_in IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='UPDATE' THEN IF OLD.check_in IS NOT NULL THEN RETURN NEW; END IF; END IF;
  kind:='attendance'; heading:='تم تسجيل حضور الطفل'; heading_en:='Child attendance recorded'; content:='تم تسجيل الحضور في الروضة.'; content_en:='Attendance at the kindergarten was recorded.'; cid:=NEW.child_id; day:=NEW.log_date;
 ELSIF TG_TABLE_NAME='daily_logs' THEN
  kind:='daily_log'; heading:='متابعة يومية جديدة'; heading_en:='New daily follow-up'; content:='أُضيفت متابعة يومية للطفل.'; content_en:='A daily follow-up was added for your child.'; cid:=NEW.child_id; day:=NEW.log_date;
 ELSIF TG_TABLE_NAME='child_notes' THEN
  kind:='note'; heading:='ملاحظة جديدة للطفل'; heading_en:='New child note'; content:=left(NEW.body,300); content_en:=content; cid:=NEW.child_id; day:=(NEW.created_at AT TIME ZONE 'Asia/Riyadh')::date;
 ELSIF TG_TABLE_NAME='activities' THEN
  IF NOT NEW.published OR NEW.class_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='UPDATE' THEN IF OLD.published THEN RETURN NEW; END IF; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
  SELECT DISTINCT g.guardian_id,c.id,'activity',NEW.id,NEW.activity_date,'نشاط جديد منشور','New published activity',NEW.title,coalesce(nullif(NEW.title_en,''),NEW.title)
  FROM public.children c JOIN public.child_guardians g ON g.child_id=c.id WHERE c.class_id=NEW.class_id AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=g.guardian_id AND r.role='parent') ON CONFLICT DO NOTHING;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='messages' THEN
  IF NEW.sender_role<>'admin' OR NOT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=NEW.sender_id AND r.role IN ('admin','super_admin')) THEN RETURN NEW; END IF;
  SELECT t.parent_id,t.child_id INTO recipient,cid FROM public.message_threads t WHERE t.id=NEW.thread_id;
  IF recipient IS NULL OR recipient=NEW.sender_id OR NOT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=recipient AND r.role='parent') THEN RETURN NEW; END IF;
  IF cid IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.child_guardians g WHERE g.child_id=cid AND g.guardian_id=recipient) THEN cid:=NULL; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,thread_id,event_type,source_id,event_date,title,title_en,body,body_en)
  VALUES(recipient,cid,NEW.thread_id,'message',NEW.id,(NEW.created_at AT TIME ZONE 'Asia/Riyadh')::date,'رسالة جديدة من الإدارة','New message from administration',CASE WHEN NEW.body<>'' THEN left(NEW.body,300) ELSE 'صورة مرفقة من الإدارة' END,CASE WHEN NEW.body<>'' THEN left(NEW.body,300) ELSE 'Photo attached by administration' END) ON CONFLICT DO NOTHING;
  RETURN NEW;
 ELSE RETURN NEW;
 END IF;
 INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
 SELECT DISTINCT g.guardian_id,cid,kind,NEW.id,day,heading,heading_en,content,content_en FROM public.child_guardians g WHERE g.child_id=cid AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=g.guardian_id AND r.role='parent') ON CONFLICT DO NOTHING;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 RAISE WARNING 'Parent notification creation failed for event %, SQLSTATE %',TG_TABLE_NAME,SQLSTATE;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_parent_child_event() FROM PUBLIC,anon,authenticated;