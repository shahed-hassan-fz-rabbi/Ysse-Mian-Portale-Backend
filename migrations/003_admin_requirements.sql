-- YSSE Main Portal - Migration 003
-- Adds columns required by the admin panel and hardens profiles RLS.
-- Run AFTER 001_supabase_schema.sql and 002_admin_panel.sql, in order.
-- All statements are guarded so re-running is safe.

-- ============================================================
-- 1. New columns on existing tables (IF NOT EXISTS = no-op on rerun)
-- ============================================================

ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_head TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS slug TEXT;

-- Application fields used by the application form and review workflow
ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Site settings: hero/featured images and featured content
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featured_heading TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featured_description TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Partial unique index for announcement slugs (NULLs are allowed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_announcements_slug
  ON announcements(slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_user_opportunity
  ON internship_applications(user_id, opportunity_id);

-- ============================================================
-- 2. Profiles RLS hardening
--    - Remove the client-side UPDATE policy: a row-level policy cannot
--      restrict WHICH columns change, so "update own profile" would also
--      let a user set their own role to 'admin'. Profile updates now go
--      through the authenticated backend endpoint (PATCH /api/auth/profile)
--      and role changes only through the admin backend endpoint.
--    - Add an INSERT policy so public registration can create its own
--      profile row, but NEVER with a role other than 'user'.
-- ============================================================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND role = 'user');

-- Keep: "Users can view own profile" (from 001) — needed by the frontend
-- to read its own role. No admin SELECT policy is required because admin
-- reads go through the backend service-role client.

-- ============================================================
-- 3. Re-verify RLS is enabled on every public table
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','departments','courses','announcements',
    'internship_opportunities','internship_applications',
    'site_settings','team_members','admin_audit_logs',
    'application_reviews','application_status_history'
  ])
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;
