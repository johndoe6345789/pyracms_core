# Backend security audit (C++ / Drogon)

Scope: everything under `pyracms-cpp-port/backend` (144 HTTP routes, 2 WebSocket endpoints, services, SQL, seeds).  
Method: enumerate every route, review each issue class, fix with tests first. Tests: `docker compose --profile tests run --build --rm backend-tests` (232 tests, 84% line coverage; 54 new security tests in `tests/test_security_*.cpp`).

## Summary

| Severity | Fixed | Accepted / remaining |
|---|---|---|
| Critical | 7 | 0 |
| High | 5 | 0 |
| Medium | 15 | 3 |
| Low | 6 | 9 |
| Info | 0 | 4 |
| **Total** | **33** | **16** |

## Route table

Roles: 0 Guest, 1 User, 2 Moderator, 3 Site admin, 4 Platform owner. `tenant 0` = platform account. Filters: `JwtAuthFilter` (valid signature, account exists, not banned, not revoked, token tenant matches any tenant named in query/body), `AdminFilter` (role >= 3 or site owner), `OwnerFilter` (object-level: author / moderator+ / site owner, or uploader / site admin), `RateLimitFilter` (per IP + route).

| # | Method | Path | Filters | Returns / changes | Tenant scoping | Verdict |
|---|--------|------|---------|-------------------|----------------|---------|
| 1 | GET | `/api/analytics/page-views` | JwtAuthFilter, AdminFilter | site traffic statistics | tenant_id, AdminFilter checks site admin/owner | OK (was F-14) |
| 2 | GET | `/api/analytics/top-content` | JwtAuthFilter, AdminFilter | site traffic statistics | tenant_id, AdminFilter checks site admin/owner | OK (was F-14) |
| 3 | GET | `/api/analytics/traffic-sources` | JwtAuthFilter, AdminFilter | site traffic statistics | tenant_id, AdminFilter checks site admin/owner | OK (was F-14) |
| 4 | GET | `/api/analytics/search-queries` | JwtAuthFilter, AdminFilter | site traffic statistics | tenant_id, AdminFilter checks site admin/owner | OK (was F-14) |
| 5 | POST | `/api/analytics/track` | RateLimitFilter | inserts one page view; anonymous | tenant_id must exist (FK) | OK: rate limited, strings capped (500), typed |
| 6 | GET | `/api/articles` | none | article list | tenant_id; viewer-aware (author/mod/site owner see non-public) | OK (was F-04) |
| 7 | POST | `/api/articles` | JwtAuthFilter | creates article for caller | tenant token must match tenant_id | OK: name/renderer/size validated |
| 8 | GET | `/api/articles/{name}` | none | article + latest content | tenant_id; private/draft hidden unless author/mod/owner | OK (was F-04) |
| 9 | PUT | `/api/articles/{name}` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 10 | DELETE | `/api/articles/{name}` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 11 | GET | `/api/articles/{name}/revisions` | none | revision history | as getArticle | OK (was F-04) |
| 12 | GET | `/api/articles/{name}/revisions/{revId}` | none | one revision | revision must belong to the visible article | OK (was F-04) |
| 13 | POST | `/api/articles/{name}/revert/{revId}` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 14 | PUT | `/api/articles/{name}/renderer` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 15 | PUT | `/api/articles/{name}/private` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 16 | POST | `/api/articles/{name}/vote` | JwtAuthFilter | like/dislike | visible articles only | OK |
| 17 | PUT | `/api/articles/{name}/tags` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 18 | POST | `/api/articles/{name}/publish` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 19 | POST | `/api/articles/{name}/schedule` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 20 | POST | `/api/articles/{name}/unpublish` | JwtAuthFilter, OwnerFilter | changes the article | OwnerFilter: author, moderator+, or site owner; tenant must match | OK (was F-03) |
| 21 | GET | `/api/articles/tags/cloud` | none | tag counts | tenant_id | OK: public data |
| 22 | POST | `/api/auth/login` | RateLimitFilter | issues JWT | tenant slug selects account scope | OK: rate limit + lockout + decoy hash (F-11) |
| 23 | POST | `/api/auth/register` | RateLimitFilter | creates account | tenant slug | OK: validated; race-free first owner (F-12, F-17) |
| 24 | GET | `/api/auth/me` | JwtAuthFilter | own profile | token | OK |
| 25 | POST | `/api/auth/forgot-password` | RateLimitFilter | sends reset mail | tenant slug | OK: uniform answer, hashed token, throttled (F-10) |
| 26 | POST | `/api/auth/reset-password` | RateLimitFilter | sets password | token | OK: atomic single use, ends sessions (F-10) |
| 27 | POST | `/api/auth/verify-email` | RateLimitFilter | spends token | token | OK: atomic; feature dormant |
| 28 | GET | `/api/auth/oauth/{provider}/url` | RateLimitFilter | provider URL + signed state | n/a | OK (F-25) |
| 29 | POST | `/api/auth/oauth/{provider}/callback` | RateLimitFilter | sign-in via provider | platform accounts | OK: state required (F-25); session binding is front-end |
| 30 | DELETE | `/api/auth/oauth/{provider}` | JwtAuthFilter | unlink provider | caller | OK |
| 31 | GET | `/api/auth/oauth/providers` | JwtAuthFilter | caller linked providers | caller | OK |
| 32 | GET | `/api/snippets` | none | snippets | tenant + private=author only | OK |
| 33 | POST | `/api/snippets` | JwtAuthFilter | own snippet | SQL author_id = caller | OK: size/language validated |
| 34 | GET | `/api/snippets/{id}` | none | snippet | tenant + private=author only | OK |
| 35 | PUT | `/api/snippets/{id}` | JwtAuthFilter | own snippet | SQL author_id = caller | OK: size/language validated |
| 36 | DELETE | `/api/snippets/{id}` | JwtAuthFilter | own snippet | SQL author_id = caller | OK: size/language validated |
| 37 | POST | `/api/snippets/{id}/run` | JwtAuthFilter, RateLimitFilter | runs code in sandbox | same visibility as get | OK (F-13): argv exec, caps, rate limit |
| 38 | POST | `/api/snippets/{id}/fork` | JwtAuthFilter | own snippet | SQL author_id = caller | OK: size/language validated |
| 39 | GET | `/api/comments/([A-Za-z_-]+)/([0-9]+)` | none | comments of (type,id) | none (public thread) | ACCEPTED A-13 |
| 40 | POST | `/api/comments/([A-Za-z_-]+)/([0-9]+)` | JwtAuthFilter | adds comment/reply | reply must share thread | OK (F-20) |
| 41 | PUT | `/api/comments/{id}` | JwtAuthFilter | own comment only (SQL user_id) | n/a | OK |
| 42 | DELETE | `/api/comments/{id}` | JwtAuthFilter | own comment only (SQL user_id) | n/a | OK |
| 43 | POST | `/api/comments/{id}/vote` | JwtAuthFilter | own comment only (SQL user_id) | n/a | OK |
| 44 | GET | `/api/docs` | none | Swagger UI / OpenAPI | n/a | OK: static; no CSP (needs CDN scripts) |
| 45 | GET | `/api/openapi.yaml` | none | Swagger UI / OpenAPI | n/a | OK: static; no CSP (needs CDN scripts) |
| 46 | POST | `/api/files` | JwtAuthFilter, RateLimitFilter | stores upload | owner + site recorded | OK (F-23) |
| 47 | GET | `/api/files/{uuid}` | none | file bytes | uuid capability URL | ACCEPTED: unguessable id; served as attachment, sandboxed |
| 48 | GET | `/api/files/{uuid}/thumbnail` | none | file bytes | uuid capability URL | as download |
| 49 | DELETE | `/api/files/{uuid}` | JwtAuthFilter, OwnerFilter | deletes file | OwnerFilter: uploader or site admin | OK (F-06) |
| 50 | GET | `/api/files` | JwtAuthFilter | file list | own files; site admin: site; platform admin: all | OK (F-06) |
| 51 | GET | `/api/forum/categories` | none | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 52 | POST | `/api/forum/categories` | JwtAuthFilter, AdminFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 53 | PUT | `/api/forum/categories/{id}` | JwtAuthFilter, AdminFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 54 | DELETE | `/api/forum/categories/{id}` | JwtAuthFilter, AdminFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 55 | GET | `/api/forum/forums/{id}` | none | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 56 | POST | `/api/forum/forums` | JwtAuthFilter, AdminFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 57 | PUT | `/api/forum/forums/{id}` | JwtAuthFilter, AdminFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 58 | DELETE | `/api/forum/forums/{id}` | JwtAuthFilter, AdminFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 59 | GET | `/api/forum/threads/{id}` | none | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 60 | POST | `/api/forum/threads` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 61 | PUT | `/api/forum/threads/{id}` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 62 | DELETE | `/api/forum/threads/{id}` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 63 | PUT | `/api/forum/threads/{id}/flags` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 64 | POST | `/api/forum/posts` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 65 | GET | `/api/forum/posts/{id}` | none | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 66 | PUT | `/api/forum/posts/{id}` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 67 | DELETE | `/api/forum/posts/{id}` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 68 | POST | `/api/forum/posts/{id}/vote` | JwtAuthFilter | forum content | SQL scoped by tenant + owner/mod (kOwnerOrMod); admin routes AdminFilter | OK (audited, unchanged) |
| 69 | GET | `/api/gallery/albums` | none | albums | tenant_id | OK |
| 70 | POST | `/api/gallery/albums` | JwtAuthFilter | creates album | tenant token match | OK: validated |
| 71 | GET | `/api/gallery/albums/{id}` | none | album + pictures | by id, public | ACCEPTED A-08 |
| 72 | PUT | `/api/gallery/albums/{id}` | JwtAuthFilter, OwnerFilter | changes album/picture | OwnerFilter: author, moderator+, site owner | OK (was F-05) |
| 73 | DELETE | `/api/gallery/albums/{id}` | JwtAuthFilter, OwnerFilter | changes album/picture | OwnerFilter: author, moderator+, site owner | OK (was F-05) |
| 74 | POST | `/api/gallery/albums/{id}/pictures` | JwtAuthFilter, OwnerFilter | changes album/picture | OwnerFilter: author, moderator+, site owner | OK (was F-05) |
| 75 | GET | `/api/gallery/pictures/{id}` | none | picture | by id, public | ACCEPTED A-08 |
| 76 | PUT | `/api/gallery/pictures/{id}` | JwtAuthFilter, OwnerFilter | changes album/picture | OwnerFilter: author, moderator+, site owner | OK (was F-05) |
| 77 | DELETE | `/api/gallery/pictures/{id}` | JwtAuthFilter, OwnerFilter | changes album/picture | OwnerFilter: author, moderator+, site owner | OK (was F-05) |
| 78 | PUT | `/api/gallery/pictures/{id}/default` | JwtAuthFilter, OwnerFilter | changes album/picture | OwnerFilter: author, moderator+, site owner | OK (was F-05) |
| 79 | POST | `/api/gallery/pictures/{id}/vote` | JwtAuthFilter | vote | any member | OK |
| 80 | POST | `/api/gamedep/{type}/{name}/dependencies` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 81 | DELETE | `/api/gamedep/{type}/{name}/dependencies/{id}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 82 | PUT | `/api/gamedep/{type}/{name}/pip` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 83 | PUT | `/api/gamedep/{type}/{name}/tags` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 84 | POST | `/api/gamedep/{type}/{name}/screenshots` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 85 | DELETE | `/api/gamedep/{type}/{name}/screenshots/{id}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 86 | POST | `/api/gamedep/{type}/{name}/vote` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 87 | GET | `/api/gamedep/{type}` | none | catalog data | tenant scope via token/tenant_id | OK: unpublished revisions owner/admin only |
| 88 | POST | `/api/gamedep/{type}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 89 | GET | `/api/gamedep/{type}/{name}` | none | catalog data | tenant scope via token/tenant_id | OK: unpublished revisions owner/admin only |
| 90 | PUT | `/api/gamedep/{type}/{name}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 91 | DELETE | `/api/gamedep/{type}/{name}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 92 | GET | `/api/outputs/json` | none | catalog data | tenant scope via token/tenant_id | OK: unpublished revisions owner/admin only |
| 93 | GET | `/api/operating-systems` | none | catalog data | tenant scope via token/tenant_id | OK: unpublished revisions owner/admin only |
| 94 | GET | `/api/architectures` | none | catalog data | tenant scope via token/tenant_id | OK: unpublished revisions owner/admin only |
| 95 | POST | `/api/gamedep/{type}/{name}/revisions` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 96 | PUT | `/api/gamedep/{type}/{name}/revisions/{ver}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 97 | DELETE | `/api/gamedep/{type}/{name}/revisions/{ver}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 98 | POST | `/api/gamedep/{type}/{name}/revisions/{ver}/publish` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 99 | POST | `/api/gamedep/{type}/{name}/revisions/{ver}/source` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 100 | POST | `/api/gamedep/{type}/{name}/revisions/{ver}/binaries` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 101 | DELETE | `/api/gamedep/{type}/{name}/revisions/{ver}/binaries/{id}` | JwtAuthFilter | changes page/revision | owner-or-admin check in GdWithPage + tenant scope | OK (audited, unchanged); download URLs use PUBLIC_BASE_URL (F-30) |
| 102 | GET | `/api/menu-groups` | none | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 103 | POST | `/api/menu-groups` | JwtAuthFilter, AdminFilter | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 104 | DELETE | `/api/menu-groups/{id}` | JwtAuthFilter, AdminFilter | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 105 | GET | `/api/menu-groups/{id}/items` | none | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 106 | POST | `/api/menu-groups/{id}/items` | JwtAuthFilter, AdminFilter | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 107 | PUT | `/api/menus/{id}` | JwtAuthFilter, AdminFilter | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 108 | DELETE | `/api/menus/{id}` | JwtAuthFilter, AdminFilter | changes menus | AdminFilter + tenant scope in SQL | OK: links validated (F-29) |
| 109 | GET | `/api/notifications` | JwtAuthFilter | own notifications | user_id in every SQL | OK |
| 110 | GET | `/api/notifications/unread-count` | JwtAuthFilter | own notifications | user_id in every SQL | OK |
| 111 | PUT | `/api/notifications/{id}/read` | JwtAuthFilter | own notifications | user_id in every SQL | OK |
| 112 | PUT | `/api/notifications/read-all` | JwtAuthFilter | own notifications | user_id in every SQL | OK |
| 113 | DELETE | `/api/notifications/{id}` | JwtAuthFilter | own notifications | user_id in every SQL | OK |
| 114 | GET | `/api/search` | none | search results | tenant_id; public+published only | OK (F-21) |
| 115 | GET | `/api/search/autocomplete` | none | search results | tenant_id; public+published only | OK (F-21) |
| 116 | GET | `/api/sitemap.xml` | none | feeds / metadata | tenant_id; public+published only | OK (F-22) |
| 117 | GET | `/api/rss.xml` | none | feeds / metadata | tenant_id; public+published only | OK (F-22) |
| 118 | GET | `/api/atom.xml` | none | feeds / metadata | tenant_id; public+published only | OK (F-22) |
| 119 | GET | `/api/articles/{name}/jsonld` | none | feeds / metadata | tenant_id; public+published only | OK (F-22) |
| 120 | GET | `/api/articles/{name}/opengraph` | none | feeds / metadata | tenant_id; public+published only | OK (F-22) |
| 121 | GET | `/api/settings` | none | site settings | tenant_id; credential-like names hidden from non-admins | OK (F-02) |
| 122 | GET | `/api/settings/{name}` | none | one setting | as list | OK (F-02) |
| 123 | PUT | `/api/settings/{name}` | JwtAuthFilter, AdminFilter | writes settings | AdminFilter (site admin/owner) + tenant match | OK (was F-02) |
| 124 | DELETE | `/api/settings/{name}` | JwtAuthFilter, AdminFilter | writes settings | AdminFilter (site admin/owner) + tenant match | OK (was F-02) |
| 125 | POST | `/api/users/{id}/follow` | JwtAuthFilter | follow | same site only | OK (F-19) |
| 126 | DELETE | `/api/users/{id}/follow` | JwtAuthFilter | unfollow | caller | OK |
| 127 | GET | `/api/users/{id}/followers` | none | public profile stats | none | ACCEPTED A-07 (usernames only; activity is public-only content) |
| 128 | GET | `/api/users/{id}/following` | none | public profile stats | none | ACCEPTED A-07 (usernames only; activity is public-only content) |
| 129 | GET | `/api/users/{id}/activity` | none | public profile stats | none | ACCEPTED A-07 (usernames only; activity is public-only content) |
| 130 | GET | `/api/users/{id}/achievements` | none | public profile stats | none | ACCEPTED A-07 (usernames only; activity is public-only content) |
| 131 | GET | `/api/users/{id}/reputation` | none | public profile stats | none | ACCEPTED A-07 (usernames only; activity is public-only content) |
| 132 | GET | `/api/tenants` | none | sites | public | OK: public directory by design |
| 133 | GET | `/api/tenants/{slug}` | none | site | public | OK |
| 134 | POST | `/api/tenants` | JwtAuthFilter, RateLimitFilter | creates site | platform accounts only | OK (F-26); rate limited |
| 135 | DELETE | `/api/tenants/{id}` | JwtAuthFilter | deletes site | owner or platform owner (SQL) | OK |
| 136 | GET | `/api/users` | JwtAuthFilter | accounts | own site; emails admin-only | OK (fixed earlier) |
| 137 | GET | `/api/users/{id}` | JwtAuthFilter | account | own site; email owner/admin only | OK (fixed earlier) |
| 138 | PUT | `/api/users/{id}` | JwtAuthFilter | own profile | id must equal caller; 5-field whitelist | OK (F-16) |
| 139 | PUT | `/api/users/{id}/password` | JwtAuthFilter | own password | id must equal caller | OK: lockout, ends sessions (F-09) |
| 140 | GET | `/api/webhooks` | JwtAuthFilter, AdminFilter | site webhooks (no secrets) | AdminFilter + tenant | OK (was F-07) |
| 141 | POST | `/api/webhooks` | JwtAuthFilter, AdminFilter | creates webhook | AdminFilter + tenant; URL SSRF-checked | OK (was F-07) |
| 142 | PUT | `/api/webhooks/{id}` | JwtAuthFilter, OwnerFilter | by-id webhook | OwnerFilter: site admin/owner of the webhook site | OK (was F-07) |
| 143 | DELETE | `/api/webhooks/{id}` | JwtAuthFilter, OwnerFilter | by-id webhook | OwnerFilter: site admin/owner of the webhook site | OK (was F-07) |
| 144 | GET | `/api/webhooks/{id}/deliveries` | JwtAuthFilter, OwnerFilter | by-id webhook | OwnerFilter: site admin/owner of the webhook site | OK (was F-07) |
| 145 | WS | `/api/ws/notifications` | token (query/header) via AuthService | own notifications, thread typing | thread must be on caller site; must be subscribed to signal | OK (was F-01); token in URL: A-02 |
| 146 | WS | `/api/ws/collab` | token (query/header) via AuthService | doc relay | rooms namespaced per site; name allow-list; 1 MB frames | OK (was F-01) |

## Findings (fixed)

| ID | Severity | Finding | Status |
|---|---|---|---|
| F-01 | Critical | WebSocket tokens verified with a different, hard-coded secret | Fixed |
| F-02 | Critical | Settings could be written by any signed-in user | Fixed |
| F-03 | Critical | IDOR on every article write route | Fixed |
| F-04 | Critical | Private/unpublished articles and any revision readable anonymously | Fixed |
| F-05 | Critical | Gallery IDOR (albums and pictures) | Fixed |
| F-06 | Critical | File delete/list without ownership; path traversal on delete | Fixed |
| F-07 | Critical | Webhooks: no authorisation, by-id IDOR, full-read SSRF | Fixed |
| F-08 | High | Hard-coded JWT secret fallback | Fixed |
| F-09 | High | No revocation: banned/deleted/reset accounts kept working | Fixed |
| F-10 | High | Password reset weaknesses | Fixed |
| F-11 | High | No brute-force protection; login timing oracle | Fixed |
| F-12 | High | First-user promotion race | Fixed |
| F-13 | Medium | Code runner built a shell string and ran unbounded | Fixed |
| F-14 | Medium | Analytics readable by any signed-in user | Fixed |
| F-15 | Medium | Database error text returned to clients | Fixed |
| F-16 | Medium | Profile update: weak validation | Fixed |
| F-17 | Medium | Registration input not validated | Fixed |
| F-18 | Medium | Mail injection | Fixed |
| F-19 | Medium | Social graph across sites; activity leaks drafts | Fixed |
| F-20 | Medium | Comment thread confusion / unbounded bodies | Fixed |
| F-21 | Medium | Search: query syntax injection and private titles | Fixed |
| F-22 | Medium | SEO endpoints leaked private drafts; base_url reflected | Fixed |
| F-23 | Medium | Unsafe upload handling | Fixed |
| F-24 | Medium | Unbounded parameters and bodies (DoS) | Fixed |
| F-25 | Medium | OAuth state not verified | Fixed (see A-16) |
| F-26 | Medium | Site slug validation not enforced | Fixed |
| F-27 | Medium | Malformed numbers crashed handlers | Fixed |
| F-28 | Low | CORS wildcard and missing response headers | Fixed |
| F-29 | Low | Menu links accepted `javascript:` URLs | Fixed |
| F-30 | Low | Catalog download URLs built from the Host header | Fixed |
| F-31 | Low | Corrupt stored hash threw in `verifyPassword` | Fixed |
| F-32 | Low | Game/dep seed logged `uq_gamedep_*` duplicate-key errors on every start | Fixed |
| F-33 | Low | Webhook update wiped omitted fields | Fixed |

**F-01 (Critical) WebSocket tokens verified with a different, hard-coded secret.** Both WebSocket controllers verified JWTs with `custom_config.jwt_secret` falling back to the literal `change-me-in-production` instead of `JWT_SECRET`. Anyone who knew that string could mint a token for any user id (including the platform owner) and read that user's notifications / join collab rooms; with a real `JWT_SECRET` the sockets simply failed. Fixed: one `wsAuthenticate()` built on `AuthService` (same secret/issuer/alg/expiry as HTTP), tenant kept in the connection, collab rooms namespaced per site, thread subscriptions checked against the caller's site, typing relay only to subscribers, frame cap 1 MB.

**F-02 (Critical) Settings could be written by any signed-in user.** `PUT/DELETE /api/settings/{name}` only required a login: any member (or any platform account for any site) could rewrite site config, ACL rules, feature toggles. Fixed: `AdminFilter` (site admin / site owner), tenant match, name/value validation; credential-like setting names are hidden from non-admins on reads.

**F-03 (Critical) IDOR on every article write route.** Update, delete, revert, renderer, privacy, tags, publish, schedule, unpublish only checked that the caller was logged in. Fixed with `OwnerFilter` (author, moderator+, or the site owner; tenant must match; unknown = 404).

**F-04 (Critical) Private/unpublished articles and any revision readable anonymously.** Article get/list/revisions ignored `is_private` and `status`; `GET /articles/{name}/revisions/{revId}` returned any revision id of any article of any site without even a tenant parameter. Fixed: one visibility predicate (public+published, or author/moderator/site owner), revisions only via their own visible article.

**F-05 (Critical) Gallery IDOR (albums and pictures).** Any user could update/delete/set-default any album or picture on any site. Fixed with `OwnerFilter`; `fileUuid` must be a real uuid; text bounded.

**F-06 (Critical) File delete/list without ownership; path traversal on delete.** `DELETE /api/files/{uuid}` deleted DB row and then `remove(uploads + "/" + uuid)` with the raw (URL-decoded) path parameter even when no row matched, so `..%2F..%2F...` could delete files outside the upload directory; anyone could delete or list everyone's files. Fixed: uuid shape enforced before any path is built, files record uploader+site (migration 050), delete = uploader or site admin, list = own/site/platform.

**F-07 (Critical) Webhooks: no authorisation, by-id IDOR, full-read SSRF.** Any signed-in user could create webhooks for any site and read/change/delete any webhook by id. The server then POSTed to any URL (loopback, RFC1918, link-local metadata, other containers) and stored the response body, returned by `/deliveries`. Fixed: admins only (`AdminFilter`/`OwnerFilter`), http(s) only, no credentials, DNS resolved and every address checked (private, loopback, link-local, CGNAT, multicast, reserved, v4-mapped/NAT64/6to4), re-checked before each delivery attempt, no redirects, response bodies truncated to 1 KB, event names validated (array-literal injection).

**F-08 (High) Hard-coded JWT secret fallback.** With `JWT_SECRET` unset the server signed tokens with a public constant (anyone could forge tokens). Fixed: random per-process secret in dev; `PYRACMS_ENV=production` refuses to start unless `JWT_SECRET` is set, 32+ chars and not a placeholder; tokens must carry `exp` and `iat`; HS256 pinned; lifetime configurable (`JWT_EXPIRY_SECONDS`).

**F-09 (High) No revocation: banned/deleted/reset accounts kept working.** Tokens were valid for 24 h regardless of ban, deletion or password change. Fixed: `JwtAuthFilter` loads the account on every request (exists, not banned, same tenant as the claim, `iat` not older than `token_valid_after`); password change/reset stamps `token_valid_after`; change-password returns a fresh token; role is taken from the DB on each request.

**F-10 (High) Password reset weaknesses.** Token stored in clear, spend was check-then-update (double use under concurrency), response time exposed whether the address exists (mail sent before answering), no throttle. Fixed: SHA-256 at rest, one atomic `UPDATE ... RETURNING`, other tokens of the account burned, uniform immediate answer, 3 mails/address/hour, sessions ended on reset.

**F-11 (High) No brute-force protection; login timing oracle.** Unlimited login/register/forgot/reset attempts; unknown accounts skipped the PBKDF2 cost. Fixed: `RateLimitFilter` (per client IP + route; proxy header trusted only from private peers, last hop), 5-failure/15-minute per-account lockout on login and change-password, decoy hash verification, password length cap 256.

**F-12 (High) First-user promotion race.** Registration counted accounts, inserted, then promoted: two simultaneous first sign-ups both became SuperAdmin (platform) or SiteAdmin (site). Fixed: role decided inside the INSERT with a partial unique index (`uq_users_scope_first`); the loser retries as a normal user. Test runs 8 concurrent sign-ups.

**F-13 (Medium) Code runner built a shell string and ran unbounded.** `popen("timeout 30 docker run ... CODE-in-single-quotes")`: the single-quote escaping was correct, but one missed case is remote code execution on the host. Also unlimited threads/containers and no size cap. Fixed: fork/exec with an argv vector (no shell), `--cap-drop=ALL`, no swap, output cap with process-group kill, 100 KB code cap, max 4 concurrent runs, 10 runs/min/IP, language allow-list kept.

**F-14 (Medium) Analytics readable by any signed-in user.** Traffic sources, top content and search queries of any site. Fixed: `AdminFilter`.

**F-15 (Medium) Database error text returned to clients.** ~120 call sites returned `e.base().what()` (table/constraint names, statement fragments). Fixed: `dbError()` returns only a class ("Already exists", "Referenced item does not exist", "Invalid value", "Database error"); details go to the debug log.

**F-16 (Medium) Profile update: weak validation.** Whitelisted fields only (role/banned/tenant unreachable: verified by test) but values were unchecked: any type, no lengths, `javascript:` website, no email check. Dynamic SQL replaced by one static statement. Fixed.

**F-17 (Medium) Registration input not validated.** Any username characters (HTML), no email check (CR/LF reached the SMTP headers), no password upper bound (PBKDF2 CPU DoS). Fixed.

**F-18 (Medium) Mail injection.** `To`/`Subject` unsanitised (header injection); notification template unescaped; links pointed at an unset `{{BASE_URL}}`. Fixed: header sanitising, HTML escaping, recipient guard, base URL from `PUBLIC_BASE_URL`.

**F-19 (Medium) Social graph across sites; activity leaks drafts.** Follow worked across tenants; activity feed included private/draft articles and private snippet code. Fixed (same-site follows; public content only; limits clamped).

**F-20 (Medium) Comment thread confusion / unbounded bodies.** A reply could name a parent from any other thread (cross-thread injection, notification spam); bodies unbounded. Fixed (parent must share the thread; 10 000 chars; typed).

**F-21 (Medium) Search: query syntax injection and private titles.** User words went into `to_tsquery` with operators; private/draft article titles in results; Elasticsearch index never dropped articles made private/unpublished (and index calls failed silently on the date field). Fixed: sanitised terms, public+published only, LIKE wildcards escaped, `refreshSearchIndex()` after every change, valid ISO dates.

**F-22 (Medium) SEO endpoints leaked private drafts; base_url reflected.** JSON-LD/OpenGraph returned excerpts of private/draft articles; `base_url` was echoed into feeds unvalidated. Fixed.

**F-23 (Medium) Unsafe upload handling.** Client filename in `Content-Disposition` and DB, inline SVG/HTML from the API origin (stored XSS), no signature check, no size cap. Fixed: basename + character filter, extension-derived type from an allow-list, magic-number check for image/pdf/zip, `attachment`, `nosniff`, CSP `sandbox`, size cap (`MAX_UPLOAD_MB`).

**F-24 (Medium) Unbounded parameters and bodies (DoS).** Negative/huge `limit`/`offset`, no JSON body cap, unlimited connections per IP. Fixed: clamps everywhere, 2 MB JSON cap (413), upload cap, idle timeout, 200 connections/IP.

**F-25 (Medium) OAuth state not verified.** `state` was client-supplied, unencoded in the URL and never checked. Fixed: server-minted HMAC state with 10-minute expiry, required on callback; provider error text no longer reflected; provider names reduced to a valid username; banned users refused.

**F-26 (Medium) Site slug validation not enforced.** `isValidSlug` existed but was never called (arbitrary slugs, e.g. `api`, spaces, upper case). Fixed.

**F-27 (Medium) Malformed numbers crashed handlers.** `std::stoi` on user input threw out of controllers. Fixed: global exception handler returns `400 Invalid request parameter` / `500 Internal server error` without detail.

**F-28 (Low) CORS wildcard and missing response headers.** Fixed: `nosniff`, `X-Frame-Options`, `Referrer-Policy`, restrictive CSP, `no-store`, HSTS behind https; `CORS_ALLOWED_ORIGINS` allow-list (default `*`; the API is bearer-token only, no cookies).

**F-29 (Low) Menu links accepted `javascript:` URLs.** Fixed (http(s), mailto, site-relative only).

**F-30 (Low) Catalog download URLs built from the Host header.** Fixed: `PUBLIC_BASE_URL` wins.

**F-31 (Low) Corrupt stored hash threw in `verifyPassword`.** Fixed (strict hex parse, length check).

**F-32 (Low) Game/dep seed logged `uq_gamedep_*` duplicate-key errors on every start.** `seed_games.sh` POSTed every page/revision again and relied on 409s (and the publish toggle). Now reads first and only creates what is missing. Seed settings also lacked the required `tenantId`.

**F-33 (Low) Webhook update wiped omitted fields.** Fixed (unsent fields keep their value).

## Accepted / remaining

| ID | Severity | Item | Why it remains |
|---|---|---|---|
| A-01 | Medium | First registrant of a new site becomes its SiteAdmin | By design (migration 021): the race is fixed, but in the window between creating a site and its owner registering, a stranger could claim it. Register the owner straight after creating the site, or pre-create the account. The site owner (`tenants.owner_id`) always keeps admin rights. |
| A-02 | Medium | WebSocket tokens travel in the query string | Browsers cannot set headers on a WebSocket. Tokens can reach proxy access logs; keep query strings out of logs and use a short `JWT_EXPIRY_SECONDS`. Better long-term: a one-time ws ticket endpoint (needs a front-end change). |
| A-03 | Low | PBKDF2-SHA256 with 100 000 iterations | Below the current OWASP figure (600 000) / Argon2id. Raising it needs a versioned hash format and re-hash on login; left to avoid breaking stored hashes in this change. |
| A-04 | Low | Rate limiter and lockout are per process | Several backend instances multiply the limits; needs Redis-backed counters. nginx adds its own limits (infra audit). |
| A-05 | Low | Platform accounts span all sites | A platform account (tenant 0) may act on any site and platform moderators/admins moderate every site. Intentional (site owners are platform accounts); roles >= 2 can only be granted in the database. |
| A-06 | Low | DNS rebinding window in webhook SSRF check | The address check and the connection are two lookups (Drogon HttpClient cannot pin an IP). Mitigated by re-checking before every attempt, no redirects, admin-only creation. Run the backend in an egress-restricted network for full protection. |
| A-07 | Info | Follower/following/activity/achievement/reputation reads are public | Only usernames and public content are exposed; no emails. |
| A-08 | Info | Gallery by-id reads ignore `is_private` | No API path can create a private album/picture; add a filter if that feature is added. |
| A-09 | Medium | `html` renderer stores raw HTML | The API validates the renderer name only; output sanitising is the front end's job (sanitising was added there in commit dd23807). |
| A-10 | Low | Public routes trust the token signature only | `viewerOf()` (optional identity on public GETs) does not hit the database, so a banned user's unexpired token still reads content it authored. Write routes are unaffected. |
| A-11 | Info | Backend mounts the Docker socket for the code runner | Compromise of the backend = control of the host daemon. Production overlay uses a socket proxy (infra audit). |
| A-12 | Low | ES / SMTP / OAuth outbound targets are not SSRF-filtered | They are operator-configured (environment), not user input. curl restricted to http(s), redirects off. |
| A-13 | Info | Comments accept any (type, id) without an existence check | Threads for non-existent content can be created (bounded by rate limits and body size). |
| A-14 | Low | No email-verification enforcement, no admin audit log | Verification tokens are consumable but nothing issues them; there is no audit trail of admin actions. |
| A-15 | Low | No API for role changes / bans | Roles and bans are DB-only, so nothing can escalate through the API; an admin UI would need the same care as the rules added here. |
| A-16 | Low | OAuth state is not bound to a browser session | The server proves the state is genuine and fresh; the front end should also compare it with the value it stored before redirecting (the OAuth UI is not wired in the front end yet). |

## Checked and found sound

- SQL injection: all statements are parameterised; the only concatenated fragments are validated integers, fixed column lists and an allow-listed `date_trunc` unit (`AnalyticsService`). LIKE patterns are escaped; `LIMIT/OFFSET` are bound integers.
- JWT: HS256 pinned (`allow_algorithm`), issuer checked, `alg: none` and unsigned tokens rejected (test), `exp`/`iat` required.
- Password hashing: per-user 16-byte random salt, constant-time compare.
- Forum, menu, snippet and game/dep services already scoped by tenant and owner in SQL; unchanged.
- Notifications and comment edit/delete are `user_id`-scoped in SQL.
- Mass assignment: profile update writes 5 whitelisted columns; role, banned, tenant, hash are unreachable from any request (test).

## Configuration added

| Variable | Effect |
|---|---|
| `PYRACMS_ENV=production` | refuse to start without a strong `JWT_SECRET` (32+ chars, no placeholder) |
| `JWT_SECRET` | required in production; unset in dev = random per-process secret |
| `JWT_EXPIRY_SECONDS` | token lifetime, 60 s - 30 days (default 86400) |
| `CORS_ALLOWED_ORIGINS` | comma list; empty = `*` |
| `PUBLIC_BASE_URL` | base for mail and catalog links |
| `MAX_UPLOAD_MB` | per-file and body cap (default 25) |
| `PYRACMS_ALLOW_PRIVATE_URLS=1` | lifts the webhook address check (dev/tests only) |

Migration `sql/050_security_hardening.sql` (idempotent): `users.token_valid_after`, `users.is_first` + unique index, `files.user_id/tenant_id`, purge of spent tokens.


## Site-owner recognition (owner vs administrator)

A site owner (`tenants.owner_id`) keeps the stored role `User`, so every
admin-level check must recognise ownership of the row's own site.

Fixed: `AdminFilter` derived the owner's site only from a tenant named in the
request, so by-id routes without `tenantId` answered 403 to owners. It now
resolves the site from the target row (`filters/TenantOfTarget`: forum
category/forum, menu group/item; forum creation via the body `categoryId`).
A named tenant may only agree with the row's site (mismatch -> 404); a site
the caller does not own -> 403; unknown row -> 404. The resolved site is
stored as request attribute `scopeTenant` and the write is confined to it
(`scopeTenantOf`), so a platform-token owner cannot reach other sites.
Creates without a row (categories, menu groups, settings, webhooks,
analytics) still name their tenant, which is inherent. Also fixed: owners can
now delete any file on their own site (`OwnerFilter`, files).

Owner/admin mismatches (frontend `canAdmin` = role >= Administrator OR
owner). All but the last are fixed: the owner of the row's own site now gets
the Administrator-level answer, and only for that site.

| Area | Status |
|---|---|
| `PUT/DELETE /api/users/{id}[/ban,/role]` | Fixed. `canAdminister` treats the owner of the target account's tenant (`AdminTarget.actorOwnsTenant`, loaded by `UserAdminService::loadTarget`) as an administrator over that tenant's accounts: may edit/ban/delete and grant roles up to Administrator (3), never Platform Owner; never on self, another site owner, a role-4 account or the last Platform Owner. Other sites' and platform accounts -> 403 (404 for role-3 admins, as before). |
| `GET /api/users`, `GET /api/users/{id}` | Fixed. A platform-token owner names the site with `?tenant_id=`; when they own it the list is that site's accounts with email/role/banned. Naming a site they do not own falls back to the default scope (nothing of it shown); by-id read of another site's account stays 404. |
| `GET /api/files` list | Fixed. Owner with `?tenant_id=` of an owned site sees every file of it; otherwise own files only. |
| Forum threads/posts, thread flags | Fixed. Edit/delete/pin-lock also accept the owner of the site the thread/post lives in (thread -> forum -> category -> tenant). Note: `users.role >= 2` moderators are still not tenant-scoped in these queries (pre-existing, unchanged). |
| Gamedep pages/revisions (`gdWithPage`) | Fixed. The owner of the page's tenant counts as administrator; scope still comes from token/named tenant, so another site's owner gets 404/403. |
| `GET /api/settings[/{name}]` credential-like names | Fixed. `withAdminFlag` accepts role >= 3 or ownership of the tenant, matching the write side. |
| Articles (OwnerFilter) | Accepted. Looked up by name, so the client must send `tenant_id`; inherent. |
