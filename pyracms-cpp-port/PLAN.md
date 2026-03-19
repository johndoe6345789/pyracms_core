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
