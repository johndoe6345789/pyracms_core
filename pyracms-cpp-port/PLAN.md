# PyraCMS C++ Port — Modernization Plan

A ground-up modernization of the pyracms-cpp-port project with three major efforts:
1. Port the Hypernucleus desktop client from PyQt5 to native C++ Qt6/QML
2. Upgrade the PyraCMS web frontend to Next.js 16 + React 19 with latest libraries, i18n/l10n, and dark/light theme support
3. Add auth, email, and creative features (real-time, social, analytics, etc.)

## Final Folder Structure
```
pyracms-cpp-port/
├── backend/          # (existing) C++ Drogon server - enhanced with new services
├── frontend/         # (existing) Next.js → upgrade to 16 + React 19
├── client/           # (NEW) C++ Qt6/QML Hypernucleus desktop client
├── docker/           # (NEW) Code snippet runtime Dockerfiles
└── cli.py            # (NEW) Python CLI setup tool
```

---

## Part 1: Hypernucleus Qt6/QML Desktop Client (`client/`)

### Architecture: MVVM with Qt6
```
client/
├── CMakeLists.txt
├── conanfile.txt
├── Dockerfile
├── src/
│   ├── main.cpp
│   ├── models/
│   │   ├── GameDepModel.h/cpp      # QAbstractItemModel for games/deps tree
│   │   ├── DependencyModel.h/cpp   # Flat model for dependency display
│   │   └── Constants.h             # GAME/DEP/INSTALLED constants
│   ├── services/
│   │   ├── ApiClient.h/cpp         # QNetworkAccessManager REST client
│   │   ├── AuthService.h/cpp       # Login/register via REST
│   │   ├── SettingsManager.h/cpp   # QSettings wrapper
│   │   ├── ModuleInstaller.h/cpp   # Download + ZIP extract (async)
│   │   ├── GameManager.h/cpp       # QProcess-based game launcher
│   │   └── PathManager.h/cpp       # QStandardPaths
│   └── viewmodels/
│       ├── MainViewModel.h/cpp     # Main window state + logic
│       └── SettingsViewModel.h/cpp # Settings dialog state
├── qml/
│   ├── Main.qml                    # ApplicationWindow + toolbar + tabs
│   ├── components/
│   │   ├── GameDepTab.qml          # Games/Deps tab with search + TreeView
│   │   ├── InfoPanel.qml           # Right panel: metadata + dep tree
│   │   ├── PicturesPanel.qml       # Thumbnail gallery (GridView)
│   │   ├── ToolBar.qml             # Run/Stop/Uninstall/Refresh/Settings/Exit
│   │   └── ProgressOverlay.qml     # Download progress dialog
│   ├── dialogs/
│   │   ├── SettingsDialog.qml      # Settings with General + OS/Arch tabs
│   │   ├── LoginDialog.qml         # Login form
│   │   └── RegisterDialog.qml      # Registration form
│   └── theme/
│       └── Theme.qml               # Singleton for colors/fonts
├── resources/
│   ├── icons/                      # PNG icons
│   └── resources.qrc               # Qt resource file
└── tests/
    ├── CMakeLists.txt
    ├── tst_ApiClient.cpp
    ├── tst_SettingsManager.cpp
    └── tst_ModuleInstaller.cpp
```

### Key C++ Classes

| Class | Base | Purpose |
|-------|------|---------|
| `ApiClient` | QObject | Async REST calls via QNetworkAccessManager |
| `AuthService` | QObject | Login/register, JWT token management |
| `GameDepModel` | QAbstractItemModel | Hierarchical tree: Root → Installed/Not Installed → Items → Versions |
| `DependencyModel` | QAbstractListModel | Flat list of (name, version) for info panel |
| `SettingsManager` | QObject | QSettings wrapper with Q_PROPERTY for QML binding |
| `ModuleInstaller` | QObject | Async download + QuaZip extraction, emits progress signals |
| `GameManager` | QObject | QProcess management for launching/stopping games |
| `PathManager` | QObject | QStandardPaths for cross-platform data dirs |
| `MainViewModel` | QObject | Coordinates models, services, exposes state to QML |
| `SettingsViewModel` | QObject | Settings dialog state, URL validation |

### Dependencies (conanfile.txt)
```
[requires]
qt/6.7.3
quazip/1.4
```

### API Integration
Client calls the existing Drogon backend endpoints:
- `GET /api/gamedep/game` → Games tree
- `GET /api/gamedep/dep` → Dependencies tree
- `GET /api/gamedep/{type}/item/{id}` → Detail panel
- `GET /api/files/{id}` → Download binaries and thumbnails
- `POST /api/auth/login` → Login
- `POST /api/auth/register` → Register

---

## Part 2: Frontend Upgrade (Next.js 16 + React 19)

### Package Updates
- next 14→16, react 18→19, @mui/material 5→6
- @testing-library/react 14→16
- All other deps to latest

### New Dependencies
- `next-intl` — i18n (8 locales: en/es/fr/de/ja/zh/nl/cy)
- `sass` — SCSS support
- `@monaco-editor/react` — Code editor
- `react-diff-viewer-continued` — Revision diffs
- `framer-motion` — Animations
- `@mui/x-data-grid` — Admin data tables
- `react-dnd` + `react-dnd-html5-backend` — Drag-and-drop menus
- `react-markdown` + `remark-gfm` — Markdown rendering
- `react-colorful` — Color picker for theme editor
- `@ducanh2912/next-pwa` — PWA support
- `@tiptap/react` + `@tiptap/starter-kit` — WYSIWYG editor
- `recharts` — Analytics charts

### Features
- i18n with next-intl (8 locales)
- Dark/light mode (MUI v6 CSS variables)
- SCSS modules
- PWA support
- Enhanced article editor (Monaco, WYSIWYG, BBCode, Markdown modes)
- Revision diffs
- phpBB-level forum
- Docker-powered code snippets
- Template/style customization per tenant
- Drag-and-drop menus
- Modern admin panel with data grids
- Responsive design
- Framer Motion animations

---

## Part 3: Auth & Email

### Gmail SMTP Email (Backend)
- `EmailService` using libcurl SMTP
- Registration confirmation, password reset, email verification
- Endpoints: forgot-password, reset-password, verify-email

### Login/Register in Qt6 Client
- `AuthService` class with JWT token management
- Login/Register QML dialogs

---

## Part 4: Creative Features

### Real-Time & WebSockets
- Drogon WebSocket controllers
- Live notifications, collaborative editing (Yjs), online presence
- Live thread updates, typing indicators

### Social & Gamification
- User profiles with activity timeline
- Reputation system with levels
- Achievement/badge system
- Activity feed, follows, @mentions

### SEO & Publishing
- Scheduled publishing with content workflow
- Auto-generated meta tags, sitemap, structured data
- RSS/Atom feeds

### API Documentation & Integrations
- OpenAPI 3.0 auto-generated docs
- Webhook system
- OAuth2 (GitHub, Google, Discord)

### Site-Wide Search
- PostgreSQL full-text search across all content types
- Faceted results, autocomplete, search analytics

### Analytics Dashboard
- Privacy-respecting page view tracking
- Admin charts (recharts)

### Docker Code Snippets
- Ephemeral Docker containers for code execution
- 7 language runtimes (Python, JS, C++, Rust, Go, Java, Ruby)

---

## Part 5: CLI Setup Tool (`cli.py`)

Python argparse CLI for setup, build, run, test, and utilities.

---

## Implementation Order

| Phase | Description |
|-------|-------------|
| 1 | Client scaffolding — folder structure, CMakeLists.txt, conanfile.txt |
| 2 | Client core — ApiClient, AuthService, SettingsManager, PathManager, Models |
| 3 | Client UI — QML files, ViewModels, Login/Register dialogs |
| 4 | Client features — ModuleInstaller, GameManager, progress dialogs |
| 5 | Backend email — EmailService with Gmail SMTP |
| 6 | Frontend upgrade — Next.js 16, React 19, MUI v6 |
| 7 | Dark/Light mode — MUI v6 CSS variables, toggle, Redux persistence |
| 8 | i18n/l10n — next-intl, 8 locales, extract all UI strings |
| 9 | Enhanced articles — Monaco editor, revision diffs, renderer switching |
| 10 | Powerful forum — phpBB features, search, moderation, PMs |
| 11 | Code snippets — Docker-powered execution, 7 languages |
| 12 | CMS customization — Template/style editor, menus, module toggles |
| 13 | Real-time & WebSockets |
| 14 | Social & gamification |
| 15 | SEO & publishing |
| 16 | API & integrations |
| 17 | Site-wide search |
| 18 | Analytics dashboard |
| 19 | Testing — unit, integration, E2E |

---

# Plan: Replace All Placeholder Data with Real API Integration

## Context

The PyraCMS C++ port frontend looks beautiful but is essentially a UI mockup — 28 hooks/components return hardcoded arrays, 13 buttons do nothing, and key navigation items (search, code section) are missing. The backend is fully running with PostgreSQL, Redis, and Elasticsearch. This plan wires everything up and adds seed data with test credentials so the site is fully functional.

---

## Phase 1: Seed Data + Test Credentials

The backend uses PBKDF2-SHA256 password hashing — can't insert raw SQL passwords. Instead, create a seed shell script that runs after the server starts, calling the register API via curl.

**New: `backend/seed.sh`** — Idempotent seed script called from `docker-entrypoint.sh`
- Register test user via `POST /api/auth/register`: `admin / admin@pyracms.com / password123`
- Register second user: `alice / alice@pyracms.com / password123`
- Create tenant via `POST /api/tenants`: slug=`demo`, display_name=`Demo Site`
- Create 5 articles via `POST /api/articles` (Getting Started, TypeScript Patterns, REST API Design, Docker Guide, CSS Grid)
- Create 2 forum categories, 3 forums, 5 threads, 10 posts via forum endpoints
- Create 2 gallery albums with sample images
- Create 3 code snippets (Python fibonacci, JS quicksort, Go hello world)
- Create menu items and settings
- Seed runs only if `GET /api/tenants` returns empty (idempotent)

**Modify: `backend/docker-entrypoint.sh`**
- After starting server in background, run `seed.sh`, then wait on server process

**Modify: `frontend/src/components/auth/LoginForm.tsx`**
- Add `Alert severity="info"` below the form: `Test credentials: admin / password123`

---

## Phase 2: Fix Navigation

**Modify: `frontend/src/hooks/useTenantNav.ts`**
- Add `CodeOutlined` import
- Add to NAV_ITEMS: `{ label: 'Code', icon: CodeOutlined, path: 'snippets' }`

**Modify: `frontend/src/components/layout/TenantAppBar.tsx`**
- Import `GlobalSearch` from `@/components/common/GlobalSearch`
- Import `SearchOutlined`, `AdminPanelSettingsOutlined`
- Add search icon button (opens GlobalSearch dialog) + admin link after nav items
- Render `<GlobalSearch />` component

**Modify: `frontend/src/components/layout/TenantDrawer.tsx`**
- Add search and admin links in the drawer for mobile

**New: `frontend/src/hooks/useTenantId.ts`**
- Takes `slug` string, calls `GET /api/tenants` to find matching tenant, returns `tenantId` number
- Caches result in state to avoid repeated lookups
- All tenant-scoped hooks will use this

---

## Phase 3: Wire Core Content Hooks to Real API

Pattern (from existing `CommentSection.tsx`):
```ts
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
useEffect(() => {
  api.get('/api/endpoint?tenant_id=' + tenantId)
    .then(res => setData(res.data))
    .catch(() => {})
    .finally(() => setLoading(false))
}, [tenantId])
```

### 3.1 `frontend/src/hooks/useArticles.ts`
- API: `GET /api/articles?tenant_id={id}`
- Add `tenantId` param, `loading` state, `useEffect` with API call
- Map: `displayName`→`title`, `name`→`name`, content snippet→`excerpt`, `viewCount`→`views`
- Keep client-side search filter on fetched results

### 3.2 `frontend/src/hooks/useArticle.ts`
- API: `GET /api/articles/{name}?tenant_id={id}`
- Returns article with latest revision content, tags, vote counts

### 3.3 `frontend/src/hooks/useRevisions.ts`
- API: `GET /api/articles/{name}/revisions?tenant_id={id}`

### 3.4 `frontend/src/hooks/useForumCategories.ts`
- API: `GET /api/forums/categories?tenant_id={id}`
- Map nested structure (categories → forums → thread/post counts)

### 3.5 `frontend/src/hooks/useThreadList.ts`
- API: `GET /api/forums/threads?forum_id={id}`
- Map thread fields, derive reply count from post count

### 3.6 `frontend/src/hooks/useThread.ts`
- API: `GET /api/forums/threads/{id}` for thread + posts
- Wire `handleSubmitReply`: `POST /api/forums/posts`

### 3.7 `frontend/src/hooks/useGalleryAlbums.ts`
- API: `GET /api/galleries?tenant_id={id}`

### 3.8 `frontend/src/hooks/useGalleryAlbum.ts`
- API: `GET /api/galleries/{id}`
- Returns album with pictures array

### 3.9 `frontend/src/hooks/useGalleryPicture.ts`
- API: `GET /api/galleries/images/{id}`
- Wire vote handlers: `POST /api/galleries/images/{id}/vote`

### 3.10 `frontend/src/hooks/useCodeAlbums.ts`
- API: `GET /api/code-snippets?tenant_id={id}`
- Group by language to form "albums"

### 3.11 `frontend/src/hooks/useCodeAlbum.ts`
- API: `GET /api/code-snippets?tenant_id={id}&language={lang}`

### 3.12 `frontend/src/hooks/data/gamePlaceholders.ts` + `depPlaceholders.ts`
- API: `GET /api/gamedep/game?tenant_id={id}` and `/api/gamedep/dep?tenant_id={id}`
- Convert to hooks: `useGameDepList.ts` already accepts items — wire API call in the page

### 3.13 `frontend/src/hooks/useCreateThread.ts`
- Wire `handleSubmit`: `POST /api/forums/threads`

---

## Phase 4: Wire Admin Hooks

### 4.1 `frontend/src/hooks/useTenantList.ts`
- API: `GET /api/tenants`
- Replace `setTimeout` mock with real `api.get`

### 4.2 `frontend/src/hooks/useAdminUsers.ts`
- API: `GET /api/users` for list
- Wire ban toggle: `PUT /api/users/{id}` with `{ banned: true/false }`

### 4.3 `frontend/src/hooks/useAdminSettings.ts`
- API: `GET /api/settings?tenant_id={id}` for list
- Wire save: `PUT /api/settings`, delete: `DELETE /api/settings/{id}`

### 4.4 `frontend/src/hooks/useFileManager.ts`
- API: `GET /api/files?tenant_id={id}` for list
- Wire upload: `POST /api/files` with `FormData`
- Wire delete: `DELETE /api/files/{id}`

### 4.5 `frontend/src/hooks/useMenuEditor.ts`
- API: `GET /api/menus?tenant_id={id}` for list
- Wire save: `PUT /api/menus/{id}`, create: `POST /api/menus`

### 4.6 `frontend/src/hooks/useFeatureToggles.ts`
- Store as settings with `feature_` prefix
- Wire save: batch `PUT /api/settings` for changed toggles

### 4.7 `frontend/src/hooks/useAclEditor.ts`
- No dedicated ACL endpoint exists — store rules as a JSON setting: `PUT /api/settings/acl_rules`

### 4.8 `frontend/src/components/dashboard/DashboardStats.tsx`
- Fetch counts from `GET /api/users` (count), `GET /api/articles` (count), etc.

### 4.9 `frontend/src/components/admin/charts/TrafficPieChart.tsx` + `TopContentChart.tsx`
- API: `GET /api/analytics?tenant_id={id}` — map response to chart data

---

## Phase 5: Fix Dead Buttons

### 5.1 Vote buttons (ArticleVoteButtons.tsx, forum/VoteButtons.tsx)
- Add `onVote: (isLike: boolean) => void` prop
- Wire onClick to call parent's vote handler → `POST /api/articles/{name}/vote` or `POST /api/forums/posts/{id}/vote`

### 5.2 PostCard.tsx — Edit/Delete
- Add `onEdit`/`onDelete` callback props
- Edit: open inline editor, save via `PUT /api/forums/posts/{id}`
- Delete: confirm dialog, then `DELETE /api/forums/posts/{id}`

### 5.3 PictureActions.tsx — Set as Cover, Edit, Delete
- Add callback props, wire to gallery API endpoints

### 5.4 CodeSnippet.tsx — Run, Edit
- Run: `POST /api/code-snippets/{id}/execute`, display output
- Edit: navigate to edit page

### 5.5 RevisionTable.tsx — View, Revert
- View: `GET /api/articles/{name}/revisions/{revId}`, show in modal
- Revert: `POST /api/articles/{name}/revert/{revId}` with confirmation

### 5.6 UserActions.tsx — Edit
- Add `onEdit` prop, parent opens edit dialog → `PUT /api/users/{id}`

### 5.7 Admin saves (templates, styles, menu editor, new snippet, fork)
- Templates: `PUT /api/settings/templates` with JSON body
- Styles: `PUT /api/settings/theme` with JSON body
- DragDropMenuEditor: `PUT /api/menus/{id}` for each reordered item
- New snippet save: `POST /api/code-snippets`
- Fork: `POST /api/code-snippets` with `forked_from` field

---

## Phase 6: Wire Search + Minor Components

### 6.1 `frontend/src/components/common/GlobalSearch.tsx`
- Replace `PLACEHOLDER_RESULTS` with debounced `GET /api/search/autocomplete?q={query}&tenant_id={id}`

### 6.2 `frontend/src/components/forum/ForumSearchBar.tsx`
- Wire search to `GET /api/search?q={query}&type=forum_post&tenant_id={id}`

### 6.3 `frontend/src/components/articles/RevisionDiffViewer.tsx`
- Remove `PLACEHOLDER_REVISIONS` fallback, require real data from parent

---

## Verification

1. `docker compose up -d --build` — rebuild with seed data
2. Open http://localhost:3099 — portal should show "Demo Site" tenant
3. Click "Demo Site" — site home with module cards
4. Login with `admin / password123` — should succeed and show logged-in state
5. Articles page — should show 5 real articles from seed data
6. Forum — should show categories with threads and posts
7. Gallery — should show albums with images
8. Code — should show snippets (accessible from nav)
9. Search (Cmd+K or search icon) — should return real results
10. Admin panel — settings, users, files should show real data
11. Vote buttons, edit/delete buttons — should call real API
12. Create new article/thread/snippet — should persist to database

---

## File Count Estimate

- **New files:** 2 (seed.sh, useTenantId.ts)
- **Modified hooks:** 21 (replacing placeholder data with API calls)
- **Modified components:** 12 (fixing dead buttons, adding search to nav)
- **Total:** ~35 files
