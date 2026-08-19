CREATE TABLE IF NOT EXISTS public.profiles (
  owner_id VARCHAR(128) PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL DEFAULT '',
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plants (
  id TEXT PRIMARY KEY,
  owner_id VARCHAR(128) NOT NULL DEFAULT auth.uid(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plants_owner_id_idx ON public.plants(owner_id);

CREATE TABLE IF NOT EXISTS public.diary_entries (
  id TEXT PRIMARY KEY,
  owner_id VARCHAR(128) NOT NULL DEFAULT auth.uid(),
  plant_id TEXT NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS diary_entries_owner_id_idx ON public.diary_entries(owner_id);
CREATE INDEX IF NOT EXISTS diary_entries_plant_id_idx ON public.diary_entries(plant_id);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.plants, public.diary_entries TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS plants_select_own ON public.plants;
CREATE POLICY plants_select_own ON public.plants FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS plants_insert_own ON public.plants;
CREATE POLICY plants_insert_own ON public.plants FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS plants_update_own ON public.plants;
CREATE POLICY plants_update_own ON public.plants FOR UPDATE TO authenticated USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS plants_delete_own ON public.plants;
CREATE POLICY plants_delete_own ON public.plants FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS diary_entries_select_own ON public.diary_entries;
CREATE POLICY diary_entries_select_own ON public.diary_entries FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS diary_entries_insert_own ON public.diary_entries;
CREATE POLICY diary_entries_insert_own ON public.diary_entries FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS diary_entries_update_own ON public.diary_entries;
CREATE POLICY diary_entries_update_own ON public.diary_entries FOR UPDATE TO authenticated USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS diary_entries_delete_own ON public.diary_entries;
CREATE POLICY diary_entries_delete_own ON public.diary_entries FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));
