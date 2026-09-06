
CREATE TYPE public.app_role AS ENUM ('parent','teacher','admin','super_admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text UNIQUE,
  title text,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('nursery','kg1','kg2')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes read" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "classes admin write" ON public.classes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.teacher_classes (
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, class_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_classes TO authenticated;
GRANT ALL ON public.teacher_classes TO service_role;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher_classes read" ON public.teacher_classes FOR SELECT TO authenticated USING (teacher_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "teacher_classes admin write" ON public.teacher_classes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text NOT NULL DEFAULT 'kg1' CHECK (stage IN ('nursery','kg1','kg2')),
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  birth_date date,
  gender text CHECK (gender IN ('female','male')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;
GRANT ALL ON public.children TO service_role;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.child_guardians (
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation text,
  PRIMARY KEY (child_id, guardian_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_guardians TO authenticated;
GRANT ALL ON public.child_guardians TO service_role;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_guardian_of(_child_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.child_guardians WHERE child_id = _child_id AND guardian_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.teaches_child(_child_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.children c
    JOIN public.teacher_classes tc ON tc.class_id = c.class_id
    WHERE c.id = _child_id AND tc.teacher_id = _user_id
  )
$$;

CREATE POLICY "children read scoped" ON public.children FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_guardian_of(id, auth.uid()) OR public.teaches_child(id, auth.uid()));
CREATE POLICY "children admin write" ON public.children FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "child_guardians read scoped" ON public.child_guardians FOR SELECT TO authenticated
USING (guardian_id = auth.uid() OR public.is_admin(auth.uid()) OR public.teaches_child(child_id, auth.uid()));
CREATE POLICY "child_guardians admin write" ON public.child_guardians FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
