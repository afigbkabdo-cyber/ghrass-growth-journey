-- Integration checks use existing linked records and always roll back.
-- Run using an authorized database connection; no fixture notifications persist.
BEGIN;
DO $$
DECLARE c record; a uuid; source uuid; notice_count integer;
BEGIN
 SELECT ch.id,ch.class_id,g.guardian_id INTO c FROM public.children ch JOIN public.child_guardians g ON g.child_id=ch.id JOIN public.user_roles r ON r.user_id=g.guardian_id AND r.role='parent' WHERE ch.class_id IS NOT NULL LIMIT 1;
 SELECT user_id INTO a FROM public.user_roles WHERE role='admin' LIMIT 1;
 IF c.id IS NULL OR a IS NULL THEN RAISE EXCEPTION 'A linked child and admin are required'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.child_attendance(id,child_id,class_id,log_date,status,check_in,recorded_by) VALUES(source,c.id,c.class_id,'2199-01-01','present',now(),a);
 IF (SELECT count(*) FROM public.parent_notifications WHERE source_id=source AND recipient_id=c.guardian_id AND event_type='attendance')<>1 THEN RAISE EXCEPTION 'Attendance notification missing'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.daily_logs(id,child_id,log_date,recorded_by) VALUES(source,c.id,'2199-01-01',a);
 IF (SELECT count(*) FROM public.parent_notifications WHERE source_id=source AND recipient_id=c.guardian_id AND event_type='daily_log')<>1 THEN RAISE EXCEPTION 'Daily log notification missing'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.child_notes(id,child_id,author_id,body) VALUES(source,c.id,a,'transaction-only verification');
 IF (SELECT count(*) FROM public.parent_notifications WHERE source_id=source AND recipient_id=c.guardian_id AND event_type='note')<>1 THEN RAISE EXCEPTION 'Note notification missing'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.activities(id,title,class_id,published,activity_date) VALUES(source,'transaction-only verification',c.class_id,false,'2199-01-01');
 IF EXISTS(SELECT 1 FROM public.parent_notifications WHERE source_id=source) THEN RAISE EXCEPTION 'Draft must not notify'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.activities(id,title,class_id,published,activity_date) VALUES(source,'transaction-only verification',c.class_id,true,'2199-01-01');
 IF (SELECT count(*) FROM public.parent_notifications WHERE source_id=source AND recipient_id=c.guardian_id AND child_id=c.id AND event_type='activity')<>1 THEN RAISE EXCEPTION 'Published class activity missing'; END IF;
 SELECT t.parent_id,t.child_id,t.id INTO c FROM public.message_threads t JOIN public.user_roles r ON r.user_id=t.parent_id AND r.role='parent' LIMIT 1;
 IF c.id IS NULL THEN RAISE EXCEPTION 'An existing parent thread is required'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.messages(id,thread_id,sender_id,sender_role,body) VALUES(source,c.id,a,'admin','transaction-only verification');
 IF (SELECT count(*) FROM public.parent_notifications WHERE source_id=source AND recipient_id=c.parent_id AND event_type='message')<>1 THEN RAISE EXCEPTION 'Admin message notification missing'; END IF;
 source:=gen_random_uuid();
 INSERT INTO public.messages(id,thread_id,sender_id,sender_role,body) VALUES(source,c.id,c.parent_id,'parent','transaction-only verification');
 IF EXISTS(SELECT 1 FROM public.parent_notifications WHERE source_id=source) THEN RAISE EXCEPTION 'Parent outgoing message must not notify parent'; END IF;
 RAISE NOTICE 'Five real event paths, class/child recipient matching, draft and outgoing-message suppression passed';
END $$;
ROLLBACK;
