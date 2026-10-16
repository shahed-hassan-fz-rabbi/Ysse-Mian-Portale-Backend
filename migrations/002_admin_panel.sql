-- Migration 002: Site Settings, Team Members, Audit Logs, Application Notes

-- Site Settings (singleton table for homepage/site configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_heading TEXT NOT NULL DEFAULT 'Empowering Young People to Create Positive Social Change',
  hero_description TEXT NOT NULL DEFAULT '',
  about_heading TEXT NOT NULL DEFAULT '',
  about_description TEXT NOT NULL DEFAULT '',
  about_image_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  footer_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Review Notes
CREATE TABLE IF NOT EXISTS application_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES internship_applications(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Status History
CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES internship_applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_dept ON team_members(department_id);
CREATE INDEX IF NOT EXISTS idx_team_members_published ON team_members(is_published);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_app_reviews_app ON application_reviews(application_id);
CREATE INDEX IF NOT EXISTS idx_app_status_history_app ON application_status_history(application_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('site_settings','team_members')
  LOOP
    EXECUTE format('CREATE TRIGGER update_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

-- RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Site Settings: anyone can read, admins can write
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON site_settings FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Team Members: anyone can read published, admins can manage
CREATE POLICY "Anyone can read published team members" ON team_members FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Audit Logs: admins only
CREATE POLICY "Admins can read audit logs" ON admin_audit_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Application Reviews: admins can manage, users can read own application reviews
CREATE POLICY "Admins can manage reviews" ON application_reviews FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can read own application reviews" ON application_reviews FOR SELECT USING (application_id IN (SELECT id FROM internship_applications WHERE user_id = auth.uid()));

-- Status History: admins can read all, users can read own
CREATE POLICY "Admins can read status history" ON application_status_history FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can read own status history" ON application_status_history FOR SELECT USING (application_id IN (SELECT id FROM internship_applications WHERE user_id = auth.uid()));
