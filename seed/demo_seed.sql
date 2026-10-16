-- ============================================================
-- YSSE Main Portal — Demo Seed Data
-- ============================================================
-- WHAT THIS IS: realistic DEMO content for departments, team
-- members, courses, announcements, internship opportunities and
-- the default site-settings row. Every record below is sample
-- data created for development and demonstration purposes only.
-- Names and copy are fictional examples — replace them with real
-- YSSE content through the Admin Panel (or delete them with the
-- cleanup snippet at the bottom of this file).
--
-- WHAT IT NEVER DOES:
--   * does NOT create user accounts or passwords,
--   * does NOT grant admin roles,
--   * does NOT touch your real content/admin-created rows,
--   * does NOT weaken RLS.
--
-- HOW TO RUN (Supabase SQL Editor):
--   1. Migrations must already be applied in order:
--        001_supabase_schema.sql → 002_admin_panel.sql →
--        003_admin_requirements.sql → 004_contact_messages.sql
--   2. Paste this whole file into
--        https://supabase.com/dashboard/project/hvyjfnauqnnkxrurtnrs/sql
--      and RUN. It is safe to run multiple times (idempotent).
--   3. Refresh the website — homepage and list pages will show
--      the demo records. Admin → Users → promote your own row
--      to admin via the SQL snippet in README.md to manage them.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Departments (idempotent: unique slug)
-- ------------------------------------------------------------
INSERT INTO departments (name, slug, description, department_head, goals, responsibilities, is_published)
VALUES
  (
    'Demo — Education & Training', 'demo-education-training',
    'The education department designs and delivers the core learning experiences of the organization: workshops, training tracks and capacity-building sessions for young social entrepreneurs.',
    'Demo — Vacant',
    '["Deliver structured training tracks on entrepreneurship fundamentals","Support participants in turning ideas into validated project plans","Build a volunteer facilitator pool for regular workshops"]'::jsonb,
    '["Curriculum design and facilitator onboarding","Running workshop series and bootcamps","Collecting participant feedback and improving sessions"]'::jsonb,
    true
  ),
  (
    'Demo — Research & Development', 'demo-research-development',
    'The research department builds the evidence base for the organization''s programs: needs assessments, field studies and policy briefs that guide our training and outreach work.',
    'Demo — Vacant',
    '["Document youth-led social ventures and their outcomes","Produce accessible research summaries for the wider community","Advise program teams with data-informed recommendations"]'::jsonb,
    '["Designing surveys and conducting field interviews","Writing reports, briefs and internal knowledge notes","Maintaining the resource library"]'::jsonb,
    true
  ),
  (
    'Demo — Communication & Outreach', 'demo-communication-outreach',
    'The communication department tells the story of the organization and its community: managing channels, campaigns and partnerships that connect young changemakers with our programs.',
    'Demo — Vacant',
    '["Grow engagement on the organization''s official channels","Publish regular community stories and program updates","Coordinate outreach campaigns with partner organizations"]'::jsonb,
    '["Content creation for social media and the website","Press, community and partner communications","Event photography and story documentation"]'::jsonb,
    true
  ),
  (
    'Demo — Operations & Partnerships', 'demo-operations-partnerships',
    'The operations department keeps programs running smoothly: logistics, volunteer coordination and the partnership relationships that sustain our activities.',
    'Demo — Vacant',
    '["Maintain smooth day-to-day program operations","Build long-term partnerships with schools and community organizations","Manage volunteer recruitment and scheduling"]'::jsonb,
    '["Event logistics and venue coordination","Volunteer onboarding and records","Partnership correspondence and agreements"]'::jsonb,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Team members (no unique key → guarded by name NOT EXISTS)
-- ------------------------------------------------------------
INSERT INTO team_members (department_id, name, designation, bio, photo_url, display_order, is_published)
SELECT d.id, 'Demo — Ayesha R.', 'Program Coordinator',
       'Coordinates the education department''s training tracks and bootcamps, and onboards new facilitators.',
       NULL, 1, true
FROM departments d
WHERE d.slug = 'demo-education-training'
  AND NOT EXISTS (SELECT 1 FROM team_members t WHERE t.name = 'Demo — Ayesha R.');

INSERT INTO team_members (department_id, name, designation, bio, photo_url, display_order, is_published)
SELECT d.id, 'Demo — Nabil H.', 'Research Lead',
       'Leads the research department''s field studies and writes accessible summaries of findings for the community.',
       NULL, 2, true
FROM departments d
WHERE d.slug = 'demo-research-development'
  AND NOT EXISTS (SELECT 1 FROM team_members t WHERE t.name = 'Demo — Nabil H.');

INSERT INTO team_members (department_id, name, designation, bio, photo_url, display_order, is_published)
SELECT d.id, 'Demo — Farhana K.', 'Communications Officer',
       'Runs the organization''s channels and publishes community stories, program updates and campaign content.',
       NULL, 3, true
FROM departments d
WHERE d.slug = 'demo-communication-outreach'
  AND NOT EXISTS (SELECT 1 FROM team_members t WHERE t.name = 'Demo — Farhana K.');

INSERT INTO team_members (department_id, name, designation, bio, photo_url, display_order, is_published)
SELECT d.id, 'Demo — Tanvir S.', 'Operations Associate',
       'Keeps program logistics running: venues, volunteers and the partnership records that support every event.',
       NULL, 4, true
FROM departments d
WHERE d.slug = 'demo-operations-partnerships'
  AND NOT EXISTS (SELECT 1 FROM team_members t WHERE t.name = 'Demo — Tanvir S.');

-- ------------------------------------------------------------
-- 3. Courses (no unique key → guarded by title NOT EXISTS)
-- ------------------------------------------------------------
INSERT INTO courses (title, description, category, recording_url, resource_url, thumbnail_url, is_published)
SELECT 'Demo — Introduction to Social Entrepreneurship',
       'A beginner-friendly session covering what social entrepreneurship is, how it differs from traditional business, and how young people can start identifying problems worth solving in their own communities.',
       'Entrepreneurship', NULL, NULL, NULL, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Demo — Introduction to Social Entrepreneurship');

INSERT INTO courses (title, description, category, recording_url, resource_url, thumbnail_url, is_published)
SELECT 'Demo — Business Model Canvas Basics',
       'A practical walkthrough of the business model canvas adapted for social ventures: customers, value proposition, channels and impact measurement — with worked examples from youth-led projects.',
       'Business Skills', NULL, NULL, NULL, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Demo — Business Model Canvas Basics');

INSERT INTO courses (title, description, category, recording_url, resource_url, thumbnail_url, is_published)
SELECT 'Demo — Measuring Social Impact',
       'An introduction to impact measurement: choosing indicators, collecting simple data, and telling the story of your project''s outcomes without overstating claims.',
       'Impact', NULL, NULL, NULL, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Demo — Measuring Social Impact');

INSERT INTO courses (title, description, category, recording_url, resource_url, thumbnail_url, is_published)
SELECT 'Demo — Public Speaking for Changemakers',
       'A skill-building session on presenting your idea with clarity: structuring a pitch, speaking to community audiences, and handling questions with confidence.',
       'Leadership', NULL, NULL, NULL, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Demo — Public Speaking for Changemakers');

-- ------------------------------------------------------------
-- 4. Announcements (slug unique partial index → guarded insert)
-- ------------------------------------------------------------
INSERT INTO announcements (title, slug, body, published_at, is_published)
SELECT 'Demo — Volunteer applications open for the next workshop season',
       'demo-volunteer-applications-open',
       'We are looking for volunteers to help facilitate the next training season. Roles include session support, logistics and documentation. Fill in the volunteer interest form from the Contact page and our team will follow up.',
       NOW() - INTERVAL '7 days', true
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE slug = 'demo-volunteer-applications-open');

INSERT INTO announcements (title, slug, body, published_at, is_published)
SELECT 'Demo — Recap: community meetup and project showcase',
       'demo-meetup-recap',
       'Thank you to everyone who joined the last community meetup. Participants presented early-stage project ideas and received feedback from peers and mentors. A full recap and photo gallery will be published soon.',
       NOW() - INTERVAL '14 days', true
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE slug = 'demo-meetup-recap');

INSERT INTO announcements (title, slug, body, published_at, is_published)
SELECT 'Demo — New learning resources added to the library',
       'demo-new-learning-resources',
       'Three new short courses have been added to the learning resources section, covering social entrepreneurship basics, the business model canvas and impact measurement. All sessions are self-paced and free to access.',
       NOW() - INTERVAL '21 days', true
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE slug = 'demo-new-learning-resources');

-- ------------------------------------------------------------
-- 5. Internship opportunities (status field + real deadlines)
--    One open with a future deadline, one rolling, one whose
--    deadline already passed (demonstrates "closed" display),
--    one draft (invisible to the public) and one admin-closed.
-- ------------------------------------------------------------
INSERT INTO internship_opportunities (title, description, requirements, application_deadline, status)
SELECT 'Demo — Education Department Intern',
       'Support the education department in preparing workshop materials, coordinating participant registration and helping facilitators during training sessions.',
       'Currently enrolled student or recent graduate. Strong written communication skills. Interest in education and community work. Availability of 10 hours per week.',
       NOW() + INTERVAL '21 days', 'published'
WHERE NOT EXISTS (SELECT 1 FROM internship_opportunities WHERE title = 'Demo — Education Department Intern');

INSERT INTO internship_opportunities (title, description, requirements, application_deadline, status)
SELECT 'Demo — Communications Intern',
       'Assist the communication department with social media content, community story write-ups and campaign support for ongoing programs.',
       'Good writing skills in English. Familiarity with social media platforms. Design or video editing skills are a plus. Availability of 8 hours per week.',
       NULL, 'published'  -- rolling deadline (always open until admin closes)
WHERE NOT EXISTS (SELECT 1 FROM internship_opportunities WHERE title = 'Demo — Communications Intern');

INSERT INTO internship_opportunities (title, description, requirements, application_deadline, status)
SELECT 'Demo — Research Intern (Previous Round)',
       'This position was part of the previous recruitment round and its deadline has passed. It stays published so applicants can see the requirements of typical research internships.',
       'Currently enrolled student or recent graduate. Comfortable with surveys and interviews. Basic report-writing skills.',
       NOW() - INTERVAL '5 days', 'published'  -- deadline passed → UI shows "Applications Closed"
WHERE NOT EXISTS (SELECT 1 FROM internship_opportunities WHERE title = 'Demo — Research Intern (Previous Round)');

INSERT INTO internship_opportunities (title, description, requirements, application_deadline, status)
SELECT 'Demo — Operations Intern (Draft)',
       'A draft posting for an upcoming operations internship. Drafts are visible only inside the Admin Panel.',
       'Requirements will be added before publication.',
       NULL, 'draft'
WHERE NOT EXISTS (SELECT 1 FROM internship_opportunities WHERE title = 'Demo — Operations Intern (Draft)');

INSERT INTO internship_opportunities (title, description, requirements, application_deadline, status)
SELECT 'Demo — Outreach Intern (Closed)',
       'This recruitment round was closed after receiving enough applications. It demonstrates how the admin panel marks an opportunity closed.',
       'N/A — this round is closed.',
       NOW() - INTERVAL '30 days', 'closed'
WHERE NOT EXISTS (SELECT 1 FROM internship_opportunities WHERE title = 'Demo — Outreach Intern (Closed)');

-- ------------------------------------------------------------
-- 6. Site settings — fill ONLY empty fields of the default row.
--    Never overwrites values an admin has already saved.
-- ------------------------------------------------------------
UPDATE site_settings SET
  hero_description = 'Youth School for Social Entrepreneurs (YSSE) is a youth-led organization working with students and young professionals to turn ideas for social change into practical, community-driven projects.',
  about_heading = 'A youth-driven platform for social change',
  about_description = 'YSSE is a youth-focused organization that believes in the power of entrepreneurship to drive social change. We work with young people to develop their entrepreneurial mindsets, build practical business skills, and support them in launching ventures that create measurable social impact.',
  footer_text = 'YSSE — Youth School for Social Entrepreneurs. Registration, learning resources and internship opportunities for young changemakers.'
WHERE id = 1
  AND (hero_description IS NULL OR hero_description = '')
  AND (about_heading IS NULL OR about_heading = '')
  AND (about_description IS NULL OR about_description = '');

-- ============================================================
-- CLEANUP — remove ALL demo records when you have real content
-- ============================================================
-- DELETE FROM internship_opportunities WHERE title LIKE 'Demo — %';
-- DELETE FROM announcements      WHERE slug  LIKE 'demo-%';
-- DELETE FROM courses            WHERE title LIKE 'Demo — %';
-- DELETE FROM team_members       WHERE name  LIKE 'Demo — %';
-- DELETE FROM departments        WHERE slug  LIKE 'demo-%';
