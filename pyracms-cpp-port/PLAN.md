# PyraCMS Rewrite — Complete Plan

A ground-up modern rewrite consolidating **all** original Python projects into one unified platform. The original code is used as a **feature guide only** — not a logic reference (it was hand-written as a junior dev project).

## Original Projects (All in C:\GitHub)

| Repo | What It Was | New Home |
|---|---|---|
| `pyracms_core/pyracms/` | Core CMS — users, groups, ACL, menus, settings, files, search, content rendering | Monolithic backend |
| `pyracms_article/` | Article/wiki plugin — revision history, multiple renderers, voting, tagging | Monolithic backend (built-in) |
| `pyracms_forum/` | Forum plugin — categories, forums, threads, posts, voting, moderation, comments | Monolithic backend (built-in) |
| `pyracms_gallery/` | Gallery plugin — albums, pictures, video, thumbnails, voting, tagging | Monolithic backend (built-in) |
| `pyracms_pycode/` | Code snippet plugin — Python code albums, execution, syntax highlighting | Monolithic backend (built-in) |
| `hypernucleus_server/` | Game/dep registry — versioned games, multi-platform binaries, voting, tagging, JSON/XML export | Monolithic backend (built-in) |
| `hypernucleus_client/` | PyQt5 desktop game launcher/downloader/installer | Standalone Qt6/QML app |
| `pyracms/` | Docker orchestration layer (just a Dockerfile) | Docker Compose |
| `pyracms2/` | Early prototype with nanoid fingerprints, multilingual support, richer types | Ideas to cherry-pick |

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | [Drogon](https://github.com/drogonframework/drogon) C++17 — 1 fat monolithic server |
| **Database** | PostgreSQL 15 via Drogon ORM |
| **Auth** | JWT (jwt-cpp) + bcrypt (bcrypt.cpp or libsodium) |
| **Search** | PostgreSQL full-text search (tsvector/tsquery) |
| **Web Frontend** | Next.js 14 (App Router) — 1 fat monolithic SPA |
| **State** | Redux Toolkit + RTK Query + Redux-Persist |
| **UI** | Material UI 5 |
| **Desktop Client** | C++ Qt6 + QML (Hypernucleus launcher) |
| **Containers** | Docker Compose (postgres, backend, frontend) |
| **Build** | CMake (backend + desktop), npm (frontend) |
| **Testing** | Testing triangle — unit/integration/E2E across all layers |

## Architecture

```
┌──────────────────────────┐
│   Next.js Web Frontend   │  1 fat SPA: CMS admin, articles, forum,
│   (localhost:3000)        │  gallery, game/dep browsing, everything
│                          │
│  - MUI 5                 │
│  - Redux Toolkit          │
│  - RTK Query             │
│  - Redux-Persist         │
└────────────┬─────────────┘
             │ REST JSON API
             ▼
┌──────────────────────────┐     ┌──────────────────────┐
│  Drogon C++ Backend      │     │  Qt6/QML Desktop     │
│  (localhost:8080)         │◀────│  (Hypernucleus       │
│                          │ API │   Launcher)           │
│  1 fat binary:           │     │                      │
│  - Auth / JWT            │     │  - Game browser      │
│  - Users / Groups / ACL  │     │  - Download manager  │
│  - CMS (menus, settings) │     │  - Game launcher     │
│  - Articles (revisions)  │     │  - Auto-updater      │
│  - Forum (threads, posts)│     └──────────────────────┘
│  - Gallery (albums, pics)│
│  - Code snippets         │
│  - Hypernucleus (games,  │
│    deps, binaries, votes)│
│  - File storage          │
│  - Search                │
│  - Feature toggles       │
└────────────┬─────────────┘
             │
    ┌────────▼─────────┐
    │  PostgreSQL 15   │
    └──────────────────┘
```

All modules are built-in but can be toggled on/off via admin panel feature flags in the settings table.

### Multi-Tenancy (Portal Model)

Simple tenant isolation — no subdomain hacks:

- **Portal page**: The root `/` shows a list of available sites (cards/tiles)
- **Click a site** → enters that tenant's context (e.g., `/site/{tenant_slug}/...`)
- **Each tenant** has its own articles, forum, gallery, settings, menus, theme
- **Users are global** — one account works across all sites
- **Permissions are per-tenant** — admin on one site doesn't mean admin on another
- **Super-admin** can create/manage tenants from a global admin panel

```
┌─────────────────────────────────┐
│         Portal (/)              │
│  ┌─────────┐  ┌─────────┐      │
│  │ Dad's   │  │ Your    │ ...  │
│  │ Site    │  │ Site    │      │
│  └────┬────┘  └────┬────┘      │
└───────┼─────────────┼───────────┘
        │             │
  /site/dads-site  /site/my-site
        │             │
   Own articles,   Own articles,
   forum, gallery  forum, gallery
```

**New tables:**
- `tenants` — id, slug, display_name, description, created_at, owner_id
- `tenant_members` — tenant_id, user_id, role (admin/member/viewer)

**All content tables get a `tenant_id` foreign key** — articles, forum categories, gallery albums, settings, menus, etc. are scoped per-tenant.

---

## Database Schema

Everything in one PostgreSQL database.

### Tenant Tables

| Table | Key Columns | Purpose |
|---|---|---|
| `tenants` | id, slug, display_name, description, created_at, owner_id | Site instances |
| `tenant_members` | tenant_id, user_id, role (super_admin/admin/member/viewer) | Per-tenant permissions |

### Core Tables (Global)

| Table | Key Columns | From |
|---|---|---|
| `users` | id, username, full_name, email, password_hash, website, birthday, sex, aboutme, created_at, banned, timezone, post_count, signature, api_uuid | pyracms_core (global — shared across tenants) |
| `groups` | id, name, display_name | pyracms_core |
| `user_groups` | user_id, group_id | pyracms_core |
| `settings` | id, name, value | pyracms_core (also stores ACL rules + feature toggles) |
| `menu_groups` | id, name | pyracms_core |
| `menus` | id, name, route_path, url, type, group_id, position, permissions | pyracms_core |
| `tokens` | id, uuid, user_id, purpose, created_at, expires_at | pyracms_core |
| `files` | id, filename, uuid, mimetype, size, created_at, is_picture, is_video, download_count, video_duration | pyracms_core |

### Article Tables

| Table | Key Columns | From |
|---|---|---|
| `articles` | id, name, display_name, private, hide_display_name, user_id, renderer_id, view_count, thread_id, album_id | pyracms_article |
| `article_revisions` | id, article_id, content, summary, user_id, created_at | pyracms_article |
| `article_renderers` | id, name (HTML, BBCODE, RESTRUCTUREDTEXT, MARKDOWN) | pyracms_article |
| `article_tags` | id, name, article_id | pyracms_article |
| `article_votes` | id, article_id, user_id, is_like (unique user+article) | pyracms_article |

### Forum Tables

| Table | Key Columns | From |
|---|---|---|
| `forum_categories` | id, name | pyracms_forum |
| `forums` | id, name, description, category_id | pyracms_forum |
| `forum_threads` | id, name, description, forum_id, view_count | pyracms_forum |
| `forum_posts` | id, title, content, created_at, user_id, thread_id, file_id | pyracms_forum |
| `forum_post_votes` | id, post_id, user_id, is_like (unique user+post) | pyracms_forum |
| `forum_tags` | id, name, thread_id | pyracms_forum |
| `forum_comments` | id, hash_text, thread_id (links external content to discussion threads) | pyracms_forum |

### Gallery Tables

| Table | Key Columns | From |
|---|---|---|
| `gallery_albums` | id, display_name, description, created_at, private, protected, user_id, default_picture_id | pyracms_gallery |
| `gallery_pictures` | id, display_name, description, created_at, private, album_id, file_id, thread_id, user_id | pyracms_gallery |
| `gallery_picture_tags` | id, name, picture_id | pyracms_gallery |
| `gallery_picture_votes` | id, picture_id, user_id, is_like (unique user+picture) | pyracms_gallery |

### Code Snippet Tables

| Table | Key Columns | From |
|---|---|---|
| `code_albums` | id, display_name, description, created_at | pyracms_pycode |
| `code_objects` | id, display_name, code, result, needs_render, created_at, album_id | pyracms_pycode |

### Hypernucleus Tables

| Table | Key Columns | From |
|---|---|---|
| `gamedep_pages` | id, type(game/dep), owner_id, name, display_name, description, created_at, view_count, thread_id, album_id | hypernucleus_server |
| `gamedep_revisions` | id, page_id, file_id, module_type(file/folder), version, created_at, published | hypernucleus_server |
| `gamedep_binaries` | id, revision_id, os_id, arch_id, file_id | hypernucleus_server |
| `operating_systems` | id, name, display_name | hypernucleus_server |
| `architectures` | id, name, display_name | hypernucleus_server |
| `gamedep_dependencies` | id, game_id, dep_revision_id | hypernucleus_server |
| `gamedep_tags` | id, name, page_id | hypernucleus_server |
| `gamedep_votes` | id, page_id, user_id, is_like (unique user+page) | hypernucleus_server |

---

## Phase 1: Backend Foundation + Auth

**Goal**: Drogon builds, PostgreSQL connected, JWT auth working end-to-end.

### 1.1 Project Setup
- [ ] Replace stub server with Drogon framework
- [ ] CMake with vcpkg or FetchContent for dependencies
- [ ] Drogon ORM code generator
- [ ] Docker multi-stage build
- [ ] Environment config (DB URL, JWT secret, host, port)

### 1.2 Database
- [ ] SQL migration files for all tables
- [ ] Seed: default groups (admin, everyone, authenticated, article, forum, forum_moderator, gallery, gamedep)
- [ ] Seed: default ACL rules, settings (100+), menus, token purposes
- [ ] Seed: OS reference data (8 entries), architecture reference data (9 entries)
- [ ] Seed: article renderers (HTML, BBCODE, RST, MARKDOWN)
- [ ] Seed: feature toggles (articles=on, forum=on, gallery=on, code_snippets=on, hypernucleus=on)
- [ ] First registered user auto-promoted to admin

### 1.3 Auth
- [ ] bcrypt password hashing
- [ ] JWT generation + verification (jwt-cpp)
- [ ] Auth middleware/filter
- [ ] Token-based registration verification
- [ ] Token-based password recovery

### 1.4 Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/logout` | Invalidate token |
| POST | `/api/auth/recover-password` | Recovery email |
| POST | `/api/auth/reset-password` | Reset via token |
| GET | `/api/auth/verify/{token}` | Verify registration |
| GET | `/api/users` | List users |
| GET | `/api/users/{id}` | Get profile |
| PUT | `/api/users/{id}` | Update profile |
| PUT | `/api/users/{id}/password` | Change password |
| GET | `/api/users/{id}/api-key` | Get API key |
| POST | `/api/users/{id}/api-key` | Regenerate API key |

---

## Phase 2: CMS Admin

**Goal**: Settings, menus, ACL, user management, backup/restore, feature toggles.

### 2.1 ACL / Authorization
- [ ] ACL rules in settings: `(Allow/Deny, Principal, Permission)`
- [ ] Principals: `everyone`, `authenticated`, `group:<name>`
- [ ] Drogon filter checking ACL per-request
- [ ] CRUD endpoints for ACL rules

### 2.2 Feature Toggles
- [ ] Settings-based feature flags: `feature_articles`, `feature_forum`, `feature_gallery`, `feature_code_snippets`, `feature_hypernucleus`
- [ ] Middleware that returns 404 for disabled feature endpoints
- [ ] Admin UI to toggle features on/off

### 2.3 Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/settings` | List all settings |
| GET | `/api/settings/{name}` | Get setting |
| PUT | `/api/settings/{name}` | Update setting |
| GET | `/api/menu-groups` | List menu groups |
| POST | `/api/menu-groups` | Create menu group |
| DELETE | `/api/menu-groups/{id}` | Delete menu group |
| GET | `/api/menu-groups/{id}/items` | List items |
| POST | `/api/menu-groups/{id}/items` | Add item |
| PUT | `/api/menus/{id}` | Update item |
| DELETE | `/api/menus/{id}` | Delete item |
| GET | `/api/admin/users` | List with admin details |
| PUT | `/api/admin/users/{id}` | Edit (ban, groups) |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/groups` | List groups |
| POST | `/api/admin/groups` | Create group |
| GET | `/api/admin/backup/{what}` | Export JSON |
| POST | `/api/admin/restore/{what}` | Import JSON |

---

## Phase 3: File Management

| Method | Path | Description |
|---|---|---|
| POST | `/api/files` | Upload file |
| GET | `/api/files/{uuid}` | Download |
| GET | `/api/files/{uuid}/thumbnail` | Thumbnail |
| DELETE | `/api/files/{uuid}` | Delete |
| GET | `/api/files` | List (admin) |

- [ ] UUID-based storage, MIME detection
- [ ] Image thumbnail generation
- [ ] Video thumbnail (frame capture)
- [ ] Download counter
- [ ] Expiring API uploads with background cleanup

---

## Phase 4: Articles

**Features**: Wiki-style articles with full revision history, multiple renderers, voting, tagging, privacy, forum comment threads, gallery albums.

| Method | Path | Description |
|---|---|---|
| GET | `/api/articles` | List articles |
| POST | `/api/articles` | Create article |
| GET | `/api/articles/{name}` | Get article (rendered) |
| GET | `/api/articles/{name}/revisions` | List revisions |
| GET | `/api/articles/{name}/revisions/{id}` | Get specific revision |
| PUT | `/api/articles/{name}` | Update (creates new revision) |
| DELETE | `/api/articles/{name}` | Delete article |
| POST | `/api/articles/{name}/revert/{revision_id}` | Revert to revision |
| PUT | `/api/articles/{name}/renderer` | Switch renderer |
| PUT | `/api/articles/{name}/private` | Toggle privacy |
| PUT | `/api/articles/{name}/tags` | Set tags |
| POST | `/api/articles/{name}/vote` | Like/dislike |

Content rendering (backend returns both raw + rendered):
- [ ] Markdown (md4c or cmark)
- [ ] HTML (sanitized passthrough)
- [ ] BBCode (custom parser)
- [ ] ReStructuredText (optional, lower priority)

---

## Phase 5: Forum

**Features**: Categories → forums → threads → posts hierarchy, voting, moderation, file attachments, quick reply, view counts, external comment threads.

| Method | Path | Description |
|---|---|---|
| GET | `/api/forum/categories` | List categories (with nested forums) |
| POST | `/api/forum/categories` | Create category |
| PUT | `/api/forum/categories/{id}` | Update category |
| DELETE | `/api/forum/categories/{id}` | Delete category |
| GET | `/api/forum/forums/{id}` | Get forum with threads |
| POST | `/api/forum/forums` | Create forum |
| PUT | `/api/forum/forums/{id}` | Update forum |
| DELETE | `/api/forum/forums/{id}` | Delete forum |
| GET | `/api/forum/threads/{id}` | Get thread with posts |
| POST | `/api/forum/threads` | Create thread (with initial post) |
| PUT | `/api/forum/threads/{id}` | Update thread |
| DELETE | `/api/forum/threads/{id}` | Delete thread |
| POST | `/api/forum/posts` | Create post (reply) |
| GET | `/api/forum/posts/{id}` | Get post |
| PUT | `/api/forum/posts/{id}` | Edit post |
| DELETE | `/api/forum/posts/{id}` | Delete post |
| POST | `/api/forum/posts/{id}/vote` | Vote on post |
| GET | `/api/forum/comments/{hash}` | Get/create comment thread for external content |

---

## Phase 6: Gallery

**Features**: Albums with pictures/videos, thumbnails, cover images, privacy, protection, tagging, voting, BBCode descriptions.

| Method | Path | Description |
|---|---|---|
| GET | `/api/gallery/albums` | List albums |
| POST | `/api/gallery/albums` | Create album |
| GET | `/api/gallery/albums/{id}` | Get album with pictures |
| PUT | `/api/gallery/albums/{id}` | Update album |
| DELETE | `/api/gallery/albums/{id}` | Delete album |
| POST | `/api/gallery/albums/{id}/pictures` | Upload picture/video |
| GET | `/api/gallery/pictures/{id}` | Get picture detail |
| PUT | `/api/gallery/pictures/{id}` | Update metadata/tags |
| DELETE | `/api/gallery/pictures/{id}` | Delete picture |
| PUT | `/api/gallery/pictures/{id}/default` | Set as album cover |
| POST | `/api/gallery/pictures/{id}/vote` | Vote on picture |

---

## Phase 7: Code Snippets

**Features**: Code albums with executable snippets, syntax highlighting, result caching, file/ZIP upload.

| Method | Path | Description |
|---|---|---|
| GET | `/api/code/albums` | List code albums |
| POST | `/api/code/albums` | Create album |
| GET | `/api/code/albums/{id}` | Get album with snippets |
| PUT | `/api/code/albums/{id}` | Update album |
| DELETE | `/api/code/albums/{id}` | Delete album |
| POST | `/api/code/albums/{id}/objects` | Create code object |
| GET | `/api/code/objects/{id}` | Get code (highlighted) + result |
| PUT | `/api/code/objects/{id}` | Update code (triggers re-run) |
| DELETE | `/api/code/objects/{id}` | Delete code object |
| POST | `/api/code/objects/{id}/run` | Execute code |
| POST | `/api/code/albums/{id}/upload` | Upload .py or .zip |

Note: Code execution runs in a disposable Docker container with Python — no direct subprocess on the host. Spin up container, execute, capture stdout/stderr, tear down. The original had zero sandboxing.

---

## Phase 8: Hypernucleus (Game/Dep Registry)

**Features**: Games and dependencies with versioned revisions, multi-platform binaries (8 OS x 9 arch), dependency linking, voting, tagging, publish workflow, JSON/XML catalog export.

### 8.1 Game/Dep CRUD

| Method | Path | Description |
|---|---|---|
| GET | `/api/gamedep/{type}` | List games or deps |
| POST | `/api/gamedep/{type}` | Create |
| GET | `/api/gamedep/{type}/{name}` | Get details + all revisions |
| PUT | `/api/gamedep/{type}/{name}` | Update metadata |
| DELETE | `/api/gamedep/{type}/{name}` | Delete (cascade) |

### 8.2 Revisions

| Method | Path | Description |
|---|---|---|
| POST | `/api/gamedep/{type}/{name}/revisions` | Create revision |
| PUT | `/api/gamedep/{type}/{name}/revisions/{ver}` | Update |
| DELETE | `/api/gamedep/{type}/{name}/revisions/{ver}` | Delete |
| POST | `/api/gamedep/{type}/{name}/revisions/{ver}/publish` | Toggle publish |
| POST | `/api/gamedep/{type}/{name}/revisions/{ver}/source` | Upload source (games only) |

### 8.3 Binaries

| Method | Path | Description |
|---|---|---|
| GET | `/api/gamedep/{type}/{name}/revisions/{ver}/binaries` | List binaries |
| POST | `/api/gamedep/{type}/{name}/revisions/{ver}/binaries` | Upload binary |
| PUT | `/api/gamedep/{type}/{name}/revisions/{ver}/binaries/{id}` | Update |
| DELETE | `/api/gamedep/{type}/{name}/revisions/{ver}/binaries/{id}` | Delete |

### 8.4 Dependencies, Tags, Votes

| Method | Path | Description |
|---|---|---|
| POST | `/api/gamedep/{type}/{name}/dependencies` | Add dep link |
| DELETE | `/api/gamedep/{type}/{name}/dependencies/{id}` | Remove dep link |
| PUT | `/api/gamedep/{type}/{name}/tags` | Set tags |
| POST | `/api/gamedep/{type}/{name}/vote` | Like/dislike |

### 8.5 Catalog Export + Reference Data

| Method | Path | Description |
|---|---|---|
| GET | `/api/outputs/json` | Full catalog JSON (for desktop client) |
| GET | `/api/outputs/xml` | Full catalog XML |
| GET | `/api/operating-systems` | List supported OS |
| GET | `/api/architectures` | List supported architectures |

---

## Phase 9: Search

| Method | Path | Description |
|---|---|---|
| GET | `/api/search?q={query}` | Search across articles, forum, gallery, games/deps |

- [ ] PostgreSQL tsvector/tsquery
- [ ] Index articles (title + content), forum posts, game/dep names + descriptions
- [ ] Return results grouped by type

---

## Phase 10: Web Frontend (Next.js — 1 Fat SPA)

### 10.1 New Dependencies to Add
```
@reduxjs/toolkit react-redux redux-persist
```

### 10.2 Project Structure
```
frontend/src/
├── app/
│   ├── layout.tsx                      # Root: MUI theme + Redux + Persist
│   ├── page.tsx                        # Home / landing
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── recover-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── users/
│   │   ├── page.tsx                    # User list
│   │   └── [id]/page.tsx              # User profile
│   ├── profile/
│   │   ├── edit/page.tsx
│   │   └── change-password/page.tsx
│   ├── search/page.tsx
│   ├── articles/
│   │   ├── page.tsx                    # Article list
│   │   ├── [name]/page.tsx            # View article (rendered)
│   │   ├── [name]/edit/page.tsx       # Edit article
│   │   ├── [name]/revisions/page.tsx  # Revision history
│   │   └── create/page.tsx
│   ├── forum/
│   │   ├── page.tsx                    # Category list
│   │   ├── [forumId]/page.tsx         # Thread list
│   │   ├── thread/[threadId]/page.tsx # View thread + posts
│   │   └── thread/create/page.tsx
│   ├── gallery/
│   │   ├── page.tsx                    # Album list
│   │   ├── [albumId]/page.tsx         # Album view (picture grid)
│   │   └── picture/[pictureId]/page.tsx # Full picture/video view
│   ├── games/
│   │   ├── page.tsx                    # Game catalog
│   │   ├── [name]/page.tsx            # Game detail (revisions, binaries, deps)
│   │   └── [name]/edit/page.tsx
│   ├── dependencies/
│   │   ├── page.tsx                    # Dep catalog
│   │   ├── [name]/page.tsx            # Dep detail
│   │   └── [name]/edit/page.tsx
│   ├── code/
│   │   ├── page.tsx                    # Code album list
│   │   └── [albumId]/page.tsx         # Album with code + results
│   └── admin/
│       ├── layout.tsx                  # Admin sidebar
│       ├── users/page.tsx
│       ├── settings/page.tsx
│       ├── features/page.tsx           # Feature toggles
│       ├── menus/page.tsx
│       ├── acl/page.tsx
│       ├── files/page.tsx
│       └── backup/page.tsx
├── components/
│   ├── layout/ (Header, Footer, Sidebar, MenuRenderer)
│   ├── auth/ (LoginForm, RegisterForm, ProtectedRoute)
│   ├── users/ (UserProfile, UserList, UserEditForm)
│   ├── articles/ (ArticleView, ArticleEditor, RevisionHistory, RendererSelect)
│   ├── forum/ (CategoryList, ThreadList, PostList, PostEditor, QuickReply, VoteButtons)
│   ├── gallery/ (AlbumGrid, PictureGrid, PictureViewer, VideoPlayer, PictureUpload)
│   ├── gamedep/ (GameDepList, GameDepDetail, RevisionList, BinaryTable, DependencyList, TagChips, VoteButtons, SourceUpload, BinaryUpload)
│   ├── code/ (CodeAlbumView, CodeEditor, CodeResult, SyntaxHighlighter)
│   ├── admin/ (SettingsEditor, MenuEditor, ACLEditor, FileManager, UserManager, FeatureToggles)
│   └── common/ (SearchBar, FlashMessages, ContentRenderer, FileDropzone, VoteButtons)
├── store/
│   ├── store.ts                        # Redux store with redux-persist
│   ├── api.ts                          # RTK Query base API (all endpoints)
│   └── slices/
│       ├── authSlice.ts
│       ├── menuSlice.ts
│       ├── settingsSlice.ts
│       └── uiSlice.ts                  # Flash messages, dark mode
├── hooks/ (useAuth, usePermissions, useFeatureFlag)
├── lib/ (axios with JWT interceptor, permissions utils)
└── theme/ (MUI theme — light/dark)
```

### 10.3 Key Frontend Features
- [ ] Redux-Persist for offline state (auth, preferences, dark mode)
- [ ] RTK Query for all API calls with caching
- [ ] Dynamic menus (permission-filtered from API)
- [ ] Dark mode toggle
- [ ] Protected routes via ACL + feature flags
- [ ] Snackbar flash messages
- [ ] Responsive MUI layout
- [ ] Markdown editor/preview (articles)
- [ ] Forum with quick reply
- [ ] Gallery lightbox with video player
- [ ] Game/dep card grid with tag filters and vote sorting
- [ ] Binary download matrix (OS x Arch)
- [ ] Code editor with syntax highlighting + execution results
- [ ] File drag-and-drop upload
- [ ] Search across all content types

---

## Phase 11: Desktop Client (Qt6 + QML)

**Goal**: Rewrite the Hypernucleus desktop launcher in C++ Qt6/QML.

### 11.1 Project Structure
```
desktop/
├── CMakeLists.txt
├── src/
│   ├── main.cpp
│   ├── models/
│   │   ├── CatalogModel.h/cpp          # Fetches /api/outputs/json
│   │   ├── TreeModel.h/cpp              # QAbstractItemModel (Installed/Not Installed)
│   │   └── SettingsManager.h/cpp        # QSettings wrapper
│   ├── controllers/
│   │   ├── DownloadManager.h/cpp        # Async downloads with progress
│   │   ├── GameLauncher.h/cpp           # QProcess for running games
│   │   └── ModuleInstaller.h/cpp        # Download → extract → track
│   └── utils/
│       ├── PathUtils.h/cpp              # Cross-platform data dirs
│       └── ZipExtractor.h/cpp           # QuaZip or libarchive
├── qml/
│   ├── main.qml                         # ApplicationWindow + StackView
│   ├── views/
│   │   ├── MainView.qml                 # SplitView: tree + detail panel
│   │   ├── GameDetailView.qml           # Info, pictures, deps, versions
│   │   ├── SettingsDialog.qml           # Repo URL, OS/arch, preferences
│   │   └── DownloadProgressDialog.qml
│   └── components/
│       ├── GameDepTree.qml
│       ├── InfoPanel.qml
│       ├── PictureGallery.qml
│       ├── ToolBar.qml                  # Run, Stop, Uninstall, Refresh, Settings, Exit
│       └── SearchField.qml
├── resources/ (icons, resources.qrc)
└── tests/
```

### 11.2 Features
- [ ] Game/dep browser (tree: Installed / Not Installed)
- [ ] Detail panel (name, description, version, pictures)
- [ ] One-click install with recursive dependency resolution
- [ ] Progressive download with progress bar
- [ ] Game launcher (QProcess) + stop/kill
- [ ] Uninstall
- [ ] Settings (repo URL, OS/arch, chunk size)
- [ ] Window state persistence (QSettings)
- [ ] Cross-platform (Windows, macOS, Linux)
- [ ] Auto-detect OS and architecture

### 11.3 API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `GET /api/outputs/json` | Full catalog |
| `GET /api/files/{uuid}` | Download binaries/source |
| `GET /api/files/{uuid}/thumbnail` | Picture thumbnails |
| `POST /api/auth/login` | Optional auth |
| `GET /api/operating-systems` | OS list |
| `GET /api/architectures` | Arch list |

---

## Phase 12: Email

- [ ] SMTP or SendGrid
- [ ] Registration verification
- [ ] Password recovery
- [ ] Email templates in settings

---

## Testing Triangle

### Unit Tests (fast, isolated, many)
**Backend (Google Test)**:
- Auth: password hashing, JWT gen/verify, token expiry
- ACL: permission checking, principal matching
- Models: CRUD for all entities
- Content rendering: markdown, BBCode, HTML sanitization
- Catalog export: JSON/XML serialization

**Frontend (Jest)**:
- Redux slices: reducers, selectors
- Components: rendering, user interaction
- Hooks: useAuth, usePermissions, useFeatureFlag
- Utils: permissions, date formatting

**Desktop (Qt Test)**:
- CatalogModel: JSON parsing
- SettingsManager: read/write
- TreeModel: data population, filtering

### Integration Tests (medium speed, real dependencies)
**Backend**:
- API endpoint tests against test PostgreSQL
- Auth flow: register → verify → login → access protected route
- Full CRUD cycles for each module
- File upload → thumbnail generation → download
- Search indexing and querying
- Feature toggle middleware

**Frontend**:
- RTK Query: mock server responses, cache behavior
- Page-level: render with Redux store, verify API calls
- Auth flow: login → redirect → protected page

### E2E Tests (slow, full stack)
**Playwright or Cypress**:
- User registration → email verify → login → create article → edit → view
- Forum: create thread → reply → vote → moderate
- Gallery: create album → upload picture → set cover → view
- Hypernucleus: create game → add revision → upload binary → publish
- Admin: toggle feature → verify disabled in UI
- Desktop: launch → browse → install game → run → stop → uninstall

---

## Execution Order

| Step | Phase | Can Parallel? |
|---|---|---|
| 1 | **Phase 1**: Drogon + auth + users | |
| 2 | **Phase 10 (auth pages)**: Login/register/dashboard | Yes, with 1 |
| 3 | **Phase 2**: Admin APIs + frontend admin pages | |
| 4 | **Phase 3**: File management | |
| 5 | **Phase 4**: Articles | |
| 6 | **Phase 5**: Forum | |
| 7 | **Phase 6**: Gallery | |
| 8 | **Phase 7**: Code snippets | |
| 9 | **Phase 8**: Hypernucleus backend | |
| 10 | **Phase 10 (rest)**: All remaining frontend pages | Yes, with 5-9 |
| 11 | **Phase 9**: Search | |
| 12 | **Phase 11**: Qt6 desktop client | Can start after 9 |
| 13 | **Phase 12**: Email | |
| 14 | Testing triangle buildout (continuous throughout) | |

---

## Nice-to-Have Ideas

- Nanoid or UUID-based public-facing IDs (don't expose auto-increment PKs in URLs)
- Built-in `created_at`/`updated_at` timestamp tracking on all entities
- Multilingual content support (i18n) — someday

---

## Current State

**Backend**: Stub C++ project. Compiles but everything is placeholder. Complete rewrite needed with Drogon.

**Frontend**: Next.js 14 + MUI 5 scaffolded. Working login/register/landing/dashboard pages, Axios API client with JWT interceptor, plugin registry skeleton. Needs Redux Toolkit + Redux-Persist + RTK Query and all content pages.

**Desktop**: Nothing yet. Original PyQt5 client at `C:\GitHub\hypernucleus_client\` for reference.

**Docker**: docker-compose.yml exists with postgres/backend/frontend services.

**Tests**: Google Test wired (backend, broken linker). Jest configured (frontend, basic tests).

### First moves:
1. Replace backend stub with real Drogon project
2. Add Redux Toolkit + Redux-Persist + RTK Query to frontend
3. Get login flow working end-to-end
4. Then iterate through phases
