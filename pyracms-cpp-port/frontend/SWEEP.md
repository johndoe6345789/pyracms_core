# Bug-class sweep

Every other instance of the bug classes the review found, across
`frontend/src`, `client/src` (Qt), `scripts/*.py` and `games/`.
Status: **fixed** (with a test), **honest** (UI now says "not available yet",
no fake success), **deferred** (reason given).

Guard rails added: `scripts/check_api_contract.py` (class A, run in CI by
`.github/workflows/api-contract.yml`) and
`scripts/tests/test_no_mangled_chars.py` (class G).

| Class | Location | Finding | Status |
|---|---|---|---|
| A API contract | `components/admin/charts/TrafficPieChart.tsx` | called `GET /api/analytics` (no such route), always 404, then fell back | **fixed** - uses the real listing calls only; dead `mapTraffic` removed |
| A | `client/src/services/ApiClient_fetchFile.cpp` | `GET /api/thumbnails/{uuid}` (404); real route is `/api/files/{uuid}/thumbnail` | **fixed** (Qt, not compiled here) |
| A | `store/endpoints/{auth,users,tenants}.ts` (RTK Query) | every URL lacked the `/api` prefix | **fixed** - prefixed; tests updated |
| A | `components/articles` vote | posted `{like}` but backend requires `{is_like, tenant_id}` (always 400) | **fixed** |
| A | all other frontend, Qt and script calls (149 routes, 158 calls) | verified by the checker | ok, 0 unmatched |
| B tenant | `hooks/admin/settingsApi.ts` (put/delete), `useFeatureToggles`, `useAclEditor` | settings PUT/DELETE read `tenantId` from the JSON body; only a `tenant_id` query was sent (400) | **fixed** - body carries `tenantId`; delete sends `{data:{tenantId}}` |
| B | `hooks/admin/useMenuGroupCreate.ts` | sent `tenant_id`; backend reads `tenantId` | **fixed** |
| B | `hooks/useArticle.ts` vote | no tenant sent | **fixed** |
| B | `hooks/useCreateThread.ts` | posted `tenantId: 0` when the site was unknown | **fixed** - refuses with a message |
| B | article/snippet/gallery/forum/analytics mutations and all tenant-required GET lists | cross-checked against the controllers | ok |
| B | `POST /api/analytics/track`, `/api/webhooks` | backend routes with no frontend caller (page views are never tracked) | deferred - feature gap, not a wrong call |
| C hardcoded | `components/common/search/useGlobalSearch.ts` | `tenant_id=1` on every site page | **fixed** - resolves the slug with `useTenantId`; no request outside a site |
| C | `components/common/SearchAutocomplete.tsx`, `hooks/useSearchPage.ts` | default tenant `1` / `'1'` fallback | **fixed** - no tenant, no request; `/search` shows an info alert |
| C | `app/sitemap.ts` | `tenant_id=1`, `/site/default/...` slug | **fixed** - lists every tenant and its articles |
| C | `lib/metadata.ts` | article OG/JSON-LD always used tenant 1 | **fixed** - tenant resolved from the slug (`lib/siteOrigin.ts`) |
| C | `app/robots.ts`, `sitemap.ts`, `metadata.ts` | `http://localhost:3000` / `:8080` fallbacks (wrong absolute URLs in production) | **fixed** - origin from `NEXT_PUBLIC_SITE_URL` or the forwarded host |
| C | `next.config.ts` `env.API_URL` | inlined the build-time value (`http://localhost:8080`) into the server bundle, so every server-side fetch (sitemap, OG, JSON-LD) hit localhost inside the container | **fixed** - removed; read at runtime (verified live: sitemap now lists all tenants) |
| C | `nginx.conf`, `nginx.tls.conf.example` `location /` | dropped Host/X-Forwarded-* (a location with its own `proxy_set_header` resets inherited ones), so Next saw `frontend:3000` as the host | **fixed** - headers repeated (nginx reloaded; sitemap/robots now use the public origin) |
| C | Qt `ApiClient.cpp`, `SettingsBase.h`, `scripts/seed_games.py` | `http://localhost:8080` defaults | deferred - user-editable dev defaults, not a server default |
| D stubs | Admin Backup, Styles, Templates, dashboard stats | see `UI_GAPS.md` | **fixed** (backup export/import via settings + menus, dashboard uses the current tenant) / **honest** (Styles, Templates: Save disabled) |
| D | `components/admin/{AdminDashboard,ActivityChart,RecentActivityList,placeholderMenu,...}` | unreachable components holding fake data and `console.log` saves | deferred - deletion needs your OK (also removes their tests); listed in `UI_GAPS.md` |
| D | `hooks/useGalleryPicture.ts` | falls back to a fake `picsum.photos` image URL | deferred |
| E dead handlers | all non-test `.tsx` | static scan for Button/IconButton/MenuItem without a handler | none reachable; `ThemePreview` buttons are an intentional mock preview |
| F silent failures | 20+ user-initiated mutations (article save tags/renderer, comments, notifications, forum posts, follow, files, menus, settings, ACL, feature toggles, votes, tenant delete, global users) | errors swallowed by `.catch(() => {})` | **fixed** - `ErrorAlert` + `apiErrorMessage`, tests per hook |
| F | initial list loads, autocomplete, hydration, clipboard copy | failure degrades to an empty state | left intentionally |
| G mangled chars | `lib/safeUrl.ts` | raw NUL/DEL/U+009F bytes inside a regex | **fixed** - `\u` escapes |
| G | `__tests__/lib/security.helpers.test.ts` | raw U+2028 inside a string literal | **fixed** - `\u2028` escape |
| G | `docker/{cpp,go,java,rust}/Dockerfile` | `sed 's/<CR>$//'` had a literal carriage return instead of `\r` | **fixed** |
| G | `__tests__/components/auth/LoginHeader.error.test.tsx` | non-UTF-8 byte (cp1252 dash) | **fixed** |
| G | 19 tracked `__pycache__/*.pyc` files | compiled files committed | deferred - needs `git rm --cached` |
