-- ============================================================
-- Migration 004: Contact Messages
-- Adds the table that backs the public contact form and the
-- admin "Messages" page. Run AFTER 001-003, in order.
-- Re-running is safe (all statements are guarded).
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- NOTE: No RLS policies are added on purpose. Contact messages are only
-- ever written through the public Express endpoint and read through the
-- admin Express endpoints, both of which use the service-role client that
-- bypasses RLS. Without policies, direct browser access is impossible.