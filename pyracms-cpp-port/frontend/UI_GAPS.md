# UI gaps audit

Backend routes (controllers/*.h) compared with what `src/app` and the hooks
actually call. Status: **fixed** (built/repaired, with tests), **deferred**
(real gap, not done here, reason given).

| Route / feature | Gap found | Status |
|---|---|---|
| Forum index `/forum` | No way to create/rename/delete a category or forum (`POST/PUT/DELETE /api/forum/categories`, `/forums`); empty state had no call to action | **fixed** - admin-only Add category / Add forum / Rename / Edit / Delete dialogs with confirm + API errors, list refreshes; empty state: "No categories yet" + button for admins, plain text for others (`useForumAdmin`, `ForumAdminDialog`, `ForumAdminBars`) |
| `/auth/forgot-password` | Login page linked to it but the page did not exist (404) | **fixed** - page + `useForgotPassword` (tenant-aware) |
| `/auth/reset-password`, `/auth/verify-email` | No pages; the backend e-mails link to `/reset-password?token=` and `/verify-email?token=` | **fixed** - pages + `next.config.ts` redirects from the e-mail URLs (query kept) |
| Change password (`PUT /api/users/{id}/password`) | Endpoint + RTK mutation existed, no UI | **fixed** - Account settings (`/site/[slug]/account`, `/account`), adopts the fresh token via `adoptFreshToken`; linked from the user menu |
| Profile edit (`PUT /api/users/{id}`) | No UI for own profile fields (fullName, email, website, aboutme, timezone) | **fixed** - same Account settings page |
| Gallery album page upload | "Upload" button was a dead stub (`onChange` TODO) | **fixed** - `POST /api/files` then `POST /api/gallery/albums/{id}/pictures`, refresh, errors shown; hidden for guests; empty state text |
| Game edit `PUT /api/gamedep/game/item/{name}` | Wrong URL (404 - real route is `/api/gamedep/{type}/{name}`) and the form was pre-filled with hard-coded "Space Blaster" data (saving would overwrite a real game) | **fixed** - loads the real item, saves page + `/tags`, shows API errors |
| Dependency edit / detail / list | All three rendered hard-coded placeholder data (SDL2 etc.); edit used the same wrong `item` URL | **fixed** - real API data, not-found state, empty state, save fixed |
| Create game / dependency (`POST /api/gamedep/{type}`) | No create UI anywhere | **fixed** - `/games/new`, `/dependencies/new`, "New game" / "New dependency" buttons for signed-in users |
| Article publish / unpublish / private / delete | Endpoints (`/publish`, `/unpublish`, `/private`, `DELETE /api/articles/{name}`) had no UI at all | **fixed** - owner action bar on the article page (status chip, publish toggle, privacy toggle, delete with confirm) |
| Forum thread "Move Thread" | Menu item shown but did nothing; backend has no move endpoint (`PUT /threads/{id}` only takes title/description) | **fixed** - item hidden unless a move handler is supplied (none is, until the backend adds an endpoint) |
| Article `POST /schedule` | No UI for scheduled publishing | deferred - needs a date picker; publish/unpublish cover the common case |
| Admin Backup page | Exports hard-coded stub data (`buildSettingsPayload`) and "import" only validates JSON, applies nothing - misleading | deferred - needs a decision on the export format for menus/settings; should be rebuilt on `GET/PUT /api/settings` and `/api/menu-groups` |
| Admin Styles / Templates editors | State is local only; Save just `console.log`s / nothing persisted (no backend routes for themes/templates) | deferred - no backend support |
| Webhooks (`/api/webhooks`, `/deliveries`) | No admin UI | deferred - new admin page + nav entry; not blocking |
| Notifications page (`GET /api/notifications`, `DELETE /{id}`) | Bell dropdown lists last 20 and marks read; no full page, no delete | deferred |
| Gallery album/picture edit + delete (`PUT/DELETE /albums/{id}`, `PUT /pictures/{id}`) | Only picture delete and set-cover exist | deferred |
| Article tags `PUT /articles/{name}/tags`, renderer switch | Handled in the editor (`saveArticle.ts`) | ok |
| OAuth (`/api/auth/oauth/*`) | No login-with-provider buttons / link-unlink UI | deferred - needs provider configuration |
| Comments edit/delete/vote, snippets CRUD/fork/run, tags cloud, search, users profile/follow, ACL, analytics, features, files, menus, settings, users (admin), super-admin tenants/users | Wired to the API | ok |
| Reset-password for tenant accounts | The e-mail link carries no tenant, so after reset the user lands on the platform login | deferred - backend would need to add `tenant` to the link |
