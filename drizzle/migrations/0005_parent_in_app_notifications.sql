CREATE TABLE public.parent_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 recipient_id uuid NOT NULL REFERENCES public.profiles(id),
 child_id uuid REFERENCES public.children(id),
 thread_id uuid REFERENCES public.message_threads(id),
 event_type text NOT NULL CHECK(event_type IN ('attendance','daily_log','note','activity','message')),
 source_id uuid NOT NULL,
 event_date date,
 title text NOT NULL,
 title_en text NOT NULL,
 body text NOT NULL,
 body_en text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 read_at timestamptz
);
GRANT SELECT ON public.parent_notifications TO authenticated;
GRANT ALL ON public.parent_notifications TO service_role;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY parent_notification_read ON public.parent_notifications FOR SELECT TO authenticated USING (
 recipient_id=auth.uid() AND public.has_role(auth.uid(),'parent') AND
 ((child_id IS NOT NULL AND public.is_guardian_of(child_id,auth.uid())) OR
 (child_id IS NULL AND thread_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.message_threads t WHERE t.id=thread_id AND t.parent_id=auth.uid())))
);
CREATE INDEX parent_notifications_inbox ON public.parent_notifications(recipient_id,created_at DESC);
CREATE UNIQUE INDEX parent_notifications_event_once ON public.parent_notifications(recipient_id,event_type,source_id,coalesce(child_id,'00000000-0000-0000-0000-000000000000'::uuid));
CREATE FUNCTION public.mark_parent_notification_read(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'parent') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 UPDATE public.parent_notifications SET read_at=coalesce(read_at,now()) WHERE id=_id AND recipient_id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Forbidden'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.mark_parent_notification_read(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mark_parent_notification_read(uuid) TO authenticated;
GRANT UPDATE(read_at) ON public.parent_notifications TO authenticated;
CREATE POLICY parent_notification_mark_read ON public.parent_notifications FOR UPDATE TO authenticated USING (
 recipient_id=auth.uid() AND public.has_role(auth.uid(),'parent') AND
 ((child_id IS NOT NULL AND public.is_guardian_of(child_id,auth.uid())) OR
 (child_id IS NULL AND thread_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.message_threads t WHERE t.id=thread_id AND t.parent_id=auth.uid())))
) WITH CHECK (recipient_id=auth.uid());
CREATE FUNCTION public.notify_parent_child_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE kind text; heading text; heading_en text; content text; content_en text; cid uuid; tid uuid; recipient uuid; day date;
BEGIN
 IF TG_TABLE_NAME='child_attendance' THEN
  IF NEW.check_in IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='UPDATE' THEN IF OLD.check_in IS NOT NULL THEN RETURN NEW; END IF; END IF;
  kind:='attendance'; heading:='تم تسجيل حضور الطفل'; heading_en:='Child attendance recorded';
  content:='تم تسجيل الحضور في الروضة.'; content_en:='Attendance at the kindergarten was recorded.'; cid:=NEW.child_id; day:=NEW.log_date;
 ELSIF TG_TABLE_NAME='daily_logs' THEN
  kind:='daily_log'; heading:='متابعة يومية جديدة'; heading_en:='New daily follow-up';
  content:='أُضيفت متابعة يومية للطفل.'; content_en:='A daily follow-up was added for your child.'; cid:=NEW.child_id; day:=NEW.log_date;
 ELSIF TG_TABLE_NAME='child_notes' THEN
  kind:='note'; heading:='ملاحظة جديدة للطفل'; heading_en:='New child note';
  content:=left(NEW.body,300); content_en:=content; cid:=NEW.child_id; day:=(NEW.created_at AT TIME ZONE 'Asia/Riyadh')::date;
 ELSIF TG_TABLE_NAME='activities' THEN
  IF NOT NEW.published OR NEW.class_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='UPDATE' THEN IF OLD.published THEN RETURN NEW; END IF; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
  SELECT DISTINCT g.guardian_id,c.id,'activity',NEW.id,NEW.activity_date,'نشاط جديد منشور','New published activity',NEW.title,coalesce(nullif(NEW.title_en,''),NEW.title)
  FROM public.children c JOIN public.child_guardians g ON g.child_id=c.id
  WHERE c.class_id=NEW.class_id AND public.has_role(g.guardian_id,'parent') ON CONFLICT DO NOTHING;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='messages' THEN
  IF NEW.sender_role<>'admin' OR NOT public.is_admin(NEW.sender_id) THEN RETURN NEW; END IF;
  SELECT t.parent_id,t.child_id INTO recipient,cid FROM public.message_threads t WHERE t.id=NEW.thread_id;
  IF recipient IS NULL OR recipient=NEW.sender_id OR NOT public.has_role(recipient,'parent') THEN RETURN NEW; END IF;
  IF cid IS NOT NULL AND NOT public.is_guardian_of(cid,recipient) THEN cid:=NULL; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,thread_id,event_type,source_id,event_date,title,title_en,body,body_en)
  VALUES(recipient,cid,NEW.thread_id,'message',NEW.id,(NEW.created_at AT TIME ZONE 'Asia/Riyadh')::date,'رسالة جديدة من الإدارة','New message from administration',CASE WHEN NEW.body<>'' THEN left(NEW.body,300) ELSE 'صورة مرفقة من الإدارة' END,CASE WHEN NEW.body<>'' THEN left(NEW.body,300) ELSE 'Photo attached by administration' END) ON CONFLICT DO NOTHING;
  RETURN NEW;
 ELSE RETURN NEW;
 END IF;
 INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
 SELECT DISTINCT g.guardian_id,cid,kind,NEW.id,day,heading,heading_en,content,content_en FROM public.child_guardians g
 WHERE g.child_id=cid AND public.has_role(g.guardian_id,'parent') ON CONFLICT DO NOTHING;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 RAISE WARNING 'Parent notification creation failed for event %, SQLSTATE %',TG_TABLE_NAME,SQLSTATE;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_parent_child_event() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER notify_parent_attendance AFTER INSERT OR UPDATE OF check_in ON public.child_attendance FOR EACH ROW EXECUTE FUNCTION public.notify_parent_child_event();
CREATE TRIGGER notify_parent_daily_log AFTER INSERT ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.notify_parent_child_event();
CREATE TRIGGER notify_parent_note AFTER INSERT ON public.child_notes FOR EACH ROW EXECUTE FUNCTION public.notify_parent_child_event();
CREATE TRIGGER notify_parent_activity AFTER INSERT OR UPDATE OF published ON public.activities FOR EACH ROW EXECUTE FUNCTION public.notify_parent_child_event();
CREATE TRIGGER notify_parent_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_parent_child_event();