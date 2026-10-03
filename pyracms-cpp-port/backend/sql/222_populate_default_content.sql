-- Populate default content for the three sites

-- Get user_id for creating content (admin/first user if exists)
WITH site_users AS (
  SELECT t.id as tenant_id, u.id as user_id
  FROM tenants t
  LEFT JOIN tenant_members tm ON t.id = tm.tenant_id AND tm.role = 'admin'
  LEFT JOIN users u ON u.id = tm.user_id
  WHERE t.slug IN ('pyracms', 'pynguins', 'josheeb')
  LIMIT 3
)
-- For now, we'll just create empty articles - the sites can be populated via the UI
-- This ensures the sites exist and are ready to use

-- PyRACMS site - Home article
INSERT INTO articles (tenant_id, name, display_name, renderer_name, is_private)
SELECT id, 'home', 'Home', 'markdown', FALSE
FROM tenants WHERE slug = 'pyracms'
ON CONFLICT DO NOTHING;

INSERT INTO article_revisions (article_id, content, summary)
SELECT a.id, '# Welcome to PyRACMS

PyRACMS is a flexible, multi-tenant content management system. This is the official PyRACMS instance.

## Features
- Multi-tenant support
- Articles and blog posts
- Forums and discussions
- Media galleries
- File storage
- Real-time collaboration

Get started by creating your own site!', 'Welcome to PyRACMS'
FROM articles a
JOIN tenants t ON a.tenant_id = t.id
WHERE t.slug = 'pyracms' AND a.name = 'home'
ON CONFLICT DO NOTHING;

-- PyNguins site - Home article
INSERT INTO articles (tenant_id, name, display_name, renderer_name, is_private)
SELECT id, 'home', 'Home', 'markdown', FALSE
FROM tenants WHERE slug = 'pynguins'
ON CONFLICT DO NOTHING;

INSERT INTO article_revisions (article_id, content, summary)
SELECT a.id, '# Welcome to PyNguins

This is a PyRACMS demo site showcasing the features and capabilities of the platform.

## What is PyRACMS?
PyRACMS (Python/C++ Real-time Collaborative Management System) is an open-source CMS designed for communities and organizations that need powerful content management with real-time collaboration.

Explore the forums, galleries, and articles to see what you can do!', 'Welcome to PyNguins'
FROM articles a
JOIN tenants t ON a.tenant_id = t.id
WHERE t.slug = 'pynguins' AND a.name = 'home'
ON CONFLICT DO NOTHING;

-- Josheeb site - Home article
INSERT INTO articles (tenant_id, name, display_name, renderer_name, is_private)
SELECT id, 'home', 'Home', 'markdown', FALSE
FROM tenants WHERE slug = 'josheeb'
ON CONFLICT DO NOTHING;

INSERT INTO article_revisions (article_id, content, summary)
SELECT a.id, '# Josheeb Site

Welcome to my personal PyRACMS site. Here you will find my thoughts, projects, and contributions.

## Whats Here
- Blog posts and articles
- Project documentation
- Community discussions
- Photo galleries
- And more!

Feel free to explore and connect!', 'Welcome to Josheeb Site'
FROM articles a
JOIN tenants t ON a.tenant_id = t.id
WHERE t.slug = 'josheeb' AND a.name = 'home'
ON CONFLICT DO NOTHING;
