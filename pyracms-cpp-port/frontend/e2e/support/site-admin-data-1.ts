// Constants

export const ADMIN_USER = {
  username: 'admin',
  password: 'password123',
}

export const SITE_SLUG = 'demo'

export const BASE = `/site/${SITE_SLUG}/admin`

// API mock responses used throughout the suite

export const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    created: '2024-01-01',
    banned: false,
  },
  {
    id: 2,
    username: 'alice',
    email: 'alice@example.com',
    created: '2024-02-15',
    banned: false,
  },
]

export const MOCK_TENANTS = [{ id: 1, slug: SITE_SLUG, name: 'Demo Site' }]

export const MOCK_SETTINGS = [
  { id: 1, key: 'site_name', value: 'Demo' },
  { id: 2, key: 'contact_email', value: 'hi@demo.com' },
]

export const MOCK_FEATURES = [
  {
    id: 'articles',
    name: 'Articles',
    description: 'Blog articles module',
    enabled: true,
  },
  {
    id: 'forum',
    name: 'Forum',
    description: 'Discussion forum',
    enabled: false,
  },
]

export const MOCK_ACL = [
  {
    id: 1,
    action: 'Allow',
    principal: 'admin',
    permission: 'manage_users',
  },
]
