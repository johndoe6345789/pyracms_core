// Credentials — change these to match your seeded test accounts
export const ADMIN_USER = {
  username: 'admin',
  password: 'password',
}

export const REGULAR_USER = {
  username: 'user1',
  password: 'password',
}

// Mocked tenant / user payloads

export const MOCK_TENANTS = [
  {
    id: 1,
    slug: 'alpha',
    displayName: 'Alpha',
    ownerUsername: 'admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    slug: 'beta',
    displayName: 'Beta',
    ownerUsername: 'user1',
    isActive: false,
    createdAt: '2026-02-01T00:00:00Z',
  },
]

export const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 4,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    role: 1,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 3,
    username: 'banned1',
    email: 'banned1@example.com',
    role: 1,
    isActive: false,
    createdAt: '2026-02-01T00:00:00Z',
  },
]
