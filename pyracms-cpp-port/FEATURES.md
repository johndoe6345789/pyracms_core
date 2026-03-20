# PyraCMS + Hypernucleus — Feature List

## Project Stats

| Metric | Count |
|---|---|
| Backend C++ source files | 43 |
| Backend lines of code | 7,499 |
| SQL migrations | 7 files (458 lines) |
| API endpoints | 86 |
| Unit tests | 13 (all passing) |
| Frontend TypeScript files | 150 |
| Frontend lines of code | 7,523 |
| React components | 74 |
| Custom hooks | 29 |
| Pages | 33 |
| **Total lines of code** | **~15,500** |

---

## Backend (Drogon C++17)

### Auth & Security
- JWT token generation and verification (jwt-cpp + Boost.JSON traits)
- PBKDF2 password hashing with random salt (OpenSSL EVP)
- Constant-time hash comparison (prevents timing attacks)
- JWT auth middleware filter on all protected endpoints
- Secure random token generation for registration/recovery
- First-registered-user auto-promoted to admin
- Input validation on all endpoints

### Users (4 endpoints)
- `GET /api/users` — list users with pagination
- `GET /api/users/{id}` — get user profile
- `PUT /api/users/{id}` — update profile (own only)
- `PUT /api/users/{id}/password` — change password (verifies current)

### Auth (3 endpoints)
- `POST /api/auth/register` — register with username/email/password validation
- `POST /api/auth/login` — login, returns JWT + user data
- `GET /api/auth/me` — get current user from token

### Multi-Tenancy (4 endpoints)
- `GET /api/tenants` — list all sites (portal)
- `GET /api/tenants/{slug}` — get site by slug
- `POST /api/tenants` — create new site
- `DELETE /api/tenants/{id}` — delete site

### Settings (4 endpoints)
- `GET /api/settings` — list settings for tenant
- `GET /api/settings/{name}` — get single setting
- `PUT /api/settings/{name}` — create/update (upsert)
- `DELETE /api/settings/{name}` — delete setting

### Menus (7 endpoints)
- `GET /api/menu-groups` — list menu groups
- `POST /api/menu-groups` — create menu group
- `DELETE /api/menu-groups/{id}` — delete menu group
- `GET /api/menu-groups/{id}/items` — list items in group
- `POST /api/menu-groups/{id}/items` — add menu item
- `PUT /api/menus/{id}` — update menu item
- `DELETE /api/menus/{id}` — delete menu item

### Articles (12 endpoints)
- `GET /api/articles` — list articles for tenant
- `POST /api/articles` — create article
- `GET /api/articles/{name}` — get article (increments view count)
- `PUT /api/articles/{name}` — update (creates new revision)
- `DELETE /api/articles/{name}` — delete article
- `GET /api/articles/{name}/revisions` — full revision history
- `GET /api/articles/{name}/revisions/{id}` — get specific revision
- `POST /api/articles/{name}/revert/{id}` — revert to old revision
- `PUT /api/articles/{name}/renderer` — switch renderer (HTML/Markdown/BBCode/RST)
- `PUT /api/articles/{name}/private` — toggle privacy
- `POST /api/articles/{name}/vote` — like/dislike (upsert)
- `PUT /api/articles/{name}/tags` — set tags

### Forum (17 endpoints)
- `GET /api/forum/categories` — list categories with nested forums
- `POST /api/forum/categories` — create category
- `PUT /api/forum/categories/{id}` — update category
- `DELETE /api/forum/categories/{id}` — delete category
- `GET /api/forum/forums/{id}` — get forum with thread list
- `POST /api/forum/forums` — create forum
- `PUT /api/forum/forums/{id}` — update forum
- `DELETE /api/forum/forums/{id}` — delete forum
- `GET /api/forum/threads/{id}` — get thread with posts (increments view count)
- `POST /api/forum/threads` — create thread with initial post
- `PUT /api/forum/threads/{id}` — update thread
- `DELETE /api/forum/threads/{id}` — delete thread
- `POST /api/forum/posts` — create reply post
- `GET /api/forum/posts/{id}` — get single post
- `PUT /api/forum/posts/{id}` — edit post
- `DELETE /api/forum/posts/{id}` — delete post
- `POST /api/forum/posts/{id}/vote` — vote on post (upsert)

### Gallery (11 endpoints)
- `GET /api/gallery/albums` — list albums for tenant
- `POST /api/gallery/albums` — create album
- `GET /api/gallery/albums/{id}` — get album with pictures
- `PUT /api/gallery/albums/{id}` — update album
- `DELETE /api/gallery/albums/{id}` — delete album (cascade)
- `POST /api/gallery/albums/{id}/pictures` — add picture/video
- `GET /api/gallery/pictures/{id}` — get picture detail
- `PUT /api/gallery/pictures/{id}` — update picture metadata
- `DELETE /api/gallery/pictures/{id}` — delete picture
- `PUT /api/gallery/pictures/{id}/default` — set as album cover
- `POST /api/gallery/pictures/{id}/vote` — vote on picture (upsert)

### File Management (5 endpoints)
- `POST /api/files` — upload file (multipart)
- `GET /api/files/{uuid}` — download file
- `GET /api/files/{uuid}/thumbnail` — get thumbnail
- `DELETE /api/files/{uuid}` — delete file
- `GET /api/files` — list all files (admin)

### Hypernucleus — Game/Dep Registry (19 endpoints)
- `GET /api/gamedep/{type}` — list games or dependencies
- `POST /api/gamedep/{type}` — create game/dep
- `GET /api/gamedep/{type}/{name}` — get with all revisions
- `PUT /api/gamedep/{type}/{name}` — update metadata
- `DELETE /api/gamedep/{type}/{name}` — delete (cascade)
- `POST /api/gamedep/{type}/{name}/revisions` — create version
- `PUT /api/gamedep/{type}/{name}/revisions/{ver}` — update version
- `DELETE /api/gamedep/{type}/{name}/revisions/{ver}` — delete version
- `POST /api/gamedep/{type}/{name}/revisions/{ver}/publish` — toggle publish
- `POST /api/gamedep/{type}/{name}/revisions/{ver}/source` — upload source (games)
- `POST /api/gamedep/{type}/{name}/revisions/{ver}/binaries` — upload binary
- `DELETE /api/gamedep/{type}/{name}/revisions/{ver}/binaries/{id}` — delete binary
- `POST /api/gamedep/{type}/{name}/dependencies` — link dependency
- `DELETE /api/gamedep/{type}/{name}/dependencies/{id}` — unlink dependency
- `PUT /api/gamedep/{type}/{name}/tags` — set tags
- `POST /api/gamedep/{type}/{name}/vote` — like/dislike (upsert)
- `GET /api/outputs/json` — full catalog export (for desktop client)
- `GET /api/operating-systems` — list supported OS
- `GET /api/architectures` — list supported CPU architectures

### Reference Data (seeded)
- 8 operating systems: Platform Independent, Windows, macOS, Linux, Solaris, FreeBSD, NetBSD, OpenBSD
- 9 architectures: Platform Independent, x86, x86_64, ARM LE, ARM BE, PPC, PPC64, SPARC, SPARC64
- 4 article renderers: HTML, BBCode, ReStructuredText, Markdown
- 8 default user groups: admin, everyone, authenticated, article, forum, forum_moderator, gallery, gamedep

---

## Database (PostgreSQL 15)

### 7 Migration Files, 25+ Tables

**Core:** users, groups, user_groups, tenants, tenant_members, settings, tokens, files
**Menus:** menu_groups, menus
**Articles:** article_renderers, articles, article_revisions, article_tags, article_votes
**Forum:** forum_categories, forums, forum_threads, forum_posts, forum_post_votes, forum_tags, forum_comments
**Gallery:** gallery_albums, gallery_pictures, gallery_picture_tags, gallery_picture_votes
**Code:** code_albums, code_objects
**Hypernucleus:** operating_systems, architectures, gamedep_pages, gamedep_revisions, gamedep_binaries, gamedep_dependencies, gamedep_tags, gamedep_votes

---

## Frontend (Next.js 14 + MUI 5 + Redux Toolkit)

### Architecture
- Next.js 14 App Router
- Material UI 5 with custom theme (light/dark mode ready)
- Redux Toolkit + RTK Query for API calls
- Redux-Persist for offline state (auth persisted to localStorage)
- ESLint + Prettier + TypeScript strict mode
- All components ~50 lines max, logic in custom hooks

### 74 React Components

**Portal (4):** HeroSection, TenantCard, TenantGrid, CreateSiteButton
**Auth (3):** LoginForm, RegisterForm, PasswordField
**Layout (3):** TenantAppBar, TenantDrawer, TenantModuleCards
**Dashboard (2):** DashboardStats, QuickActions
**Articles (10):** ArticleCard, ArticleCardMeta, ArticleTagChips, ArticleList, ArticleSearchBar, ArticleContent, ArticleMetadata, ArticleVoteButtons, ArticleActions, ArticleEditorForm, RevisionTable
**Forum (7):** CategoryAccordion, ForumCard, ThreadTable, PostCard, VoteButtons, QuickReplyForm, CreateThreadForm
**Gallery (6):** AlbumCard, AlbumGrid, PictureGrid, PictureViewer, VideoPlayer, PictureActions
**Game/Dep (12):** GameDepCard, GameDepGrid, GameDepDetail, RevisionTable, BinaryMatrix, DependencyList, ScreenshotGrid, TagInput, BasicInfoForm, EditRevisionTable, SourceUpload, BinaryUpload
**Code (3):** CodeAlbumCard, CodeSnippet, CodeResult
**Common (5):** BackButton, SearchFilterBar, TabPanel, TagChips, VoteButtons
**Admin (18):** StatCard, QuickLinkCard, UserTable, UserActions, SettingsTable, SettingRow, AddSettingForm, FeatureToggleCard, MenuGroupSelect, MenuItemTable, AclRuleTable, AddAclRuleForm, FileCard, FileGrid, UploadDropzone, ExportButtons, ImportSection, ConfirmDialog

### 29 Custom Hooks

**Auth:** useLogin, useRegister
**Portal:** useTenantList, useTenantNav
**Articles:** useArticles, useArticle, useArticleEditor, useRevisions
**Forum:** useForumCategories, useThreadList, useThread, useCreateThread
**Gallery:** useGalleryAlbums, useGalleryAlbum, useGalleryPicture
**Game/Dep:** useGameDepList, useGameDepDetail, useGameDepEditor
**Code:** useCodeAlbums, useCodeAlbum
**Admin:** useAdminUsers, useAdminSettings, useFeatureToggles, useMenuEditor, useAclEditor, useFileManager, useBackupRestore

### 33 Pages

**Portal & Auth:**
- `/` — Multi-tenant portal (site picker)
- `/auth/login` — Login
- `/auth/register` — Registration
- `/dashboard` — User dashboard

**Tenant Site (`/site/[slug]/...`):**
- `/site/[slug]` — Tenant home with module cards
- `/site/[slug]/articles` — Article list
- `/site/[slug]/articles/create` — Create article
- `/site/[slug]/articles/[name]` — View article
- `/site/[slug]/articles/[name]/edit` — Edit article
- `/site/[slug]/articles/[name]/revisions` — Revision history
- `/site/[slug]/forum` — Forum categories
- `/site/[slug]/forum/[forumId]` — Thread list
- `/site/[slug]/forum/thread/[threadId]` — View thread + posts
- `/site/[slug]/forum/thread/create` — Create thread
- `/site/[slug]/gallery` — Album list
- `/site/[slug]/gallery/[albumId]` — Album pictures
- `/site/[slug]/gallery/picture/[pictureId]` — Full picture/video view
- `/site/[slug]/games` — Game catalog
- `/site/[slug]/games/[name]` — Game detail (revisions, binaries, deps)
- `/site/[slug]/games/[name]/edit` — Edit game
- `/site/[slug]/dependencies` — Dependency catalog
- `/site/[slug]/dependencies/[name]` — Dep detail
- `/site/[slug]/dependencies/[name]/edit` — Edit dependency
- `/site/[slug]/code` — Code album list
- `/site/[slug]/code/[albumId]` — Code snippets view

**Admin (`/admin/...`):**
- `/admin` — Admin dashboard
- `/admin/users` — User management
- `/admin/settings` — Key-value settings editor
- `/admin/features` — Feature toggles (articles, forum, gallery, code, hypernucleus)
- `/admin/menus` — Menu editor
- `/admin/acl` — ACL rule editor
- `/admin/files` — File manager with upload
- `/admin/backup` — Backup/restore

---

## Tooling & DevOps

### Build System
- **CMake** with auto-generation via Python + Jinja2 (`python generate_cmake.py`)
- **Conan 2** for C++ dependencies (Drogon, jwt-cpp, OpenSSL, Boost, jsoncpp)
- **npm** for frontend dependencies

### C++ Linting
- **clang-tidy** — bugprone, cppcoreguidelines, modernize, performance, readability checks
- **clang-format** — LLVM-based style, 100 column limit

### Frontend Linting
- **ESLint** — next/core-web-vitals + @typescript-eslint + prettier integration
- **Prettier** — single quotes, semicolons, trailing commas, 100 char width

### Testing
- **Google Test** — 13 unit tests for auth service (password hashing, JWT, tokens)
- **Jest** — configured for frontend (React Testing Library)

### Docker
- **docker-compose.yml** — PostgreSQL 15, Drogon backend, Next.js frontend

---

## What's Next

- [ ] Wire RTK Query hooks to real backend endpoints (replace placeholder data)
- [ ] PostgreSQL integration tests
- [ ] Docker multi-stage build for C++ backend
- [ ] Content rendering (Markdown via md4c, BBCode parser, HTML sanitizer)
- [ ] Full-text search (PostgreSQL tsvector/tsquery)
- [ ] Email (SMTP/SendGrid for registration verification + password recovery)
- [ ] MIME detection for file uploads
- [ ] Qt6/QML desktop client (Hypernucleus game launcher)
- [ ] E2E tests (Playwright)
- [ ] Dark mode theme toggle
- [ ] Code snippet execution via Docker sandbox
