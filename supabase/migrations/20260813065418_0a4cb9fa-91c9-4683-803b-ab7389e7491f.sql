CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('pdf', 'chat')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_select_own" ON public.usage_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "usage_insert_own" ON public.usage_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX usage_events_user_dia_idx ON public.usage_events (user_id, tipo, created_at DESC);

CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_set_plan(_email text, _plan public.plan_tipo)
RETURNS TABLE (id uuid, email text, plan public.plan_tipo)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  UPDATE public.profiles p SET plan = _plan, updated_at = now()
  WHERE lower(p.email) = lower(trim(_email))
  RETURNING p.id, p.email, p.plan;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_plan(text, public.plan_tipo) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_plan(text, public.plan_tipo) TO authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'cafekun14@gmail.com'
ON CONFLICT DO NOTHING;