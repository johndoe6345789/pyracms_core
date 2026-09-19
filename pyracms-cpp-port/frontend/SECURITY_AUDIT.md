# Frontend security audit

Scope: `frontend/` (Next 15 / React 19 / MUI). Backend not covered.
Status: FIXED = repaired + tested, OPEN = documented risk, N/A = reviewed, fine.

| # | Sev | Finding | Status |
|---|-----|---------|--------|
| 1 | Critical | next 15.5.21 advisories (RCE via AVIF image optimiser, Windows RCE) | FIXED: pinned 15.5.25 |
| 2 | High | DOMPurify returns input UNSANITISED when no DOM (SSR): ArticleContent server-rendered raw HTML | FIXED: `lib/sanitize.ts` returns '' without a DOM; ArticleContent sanitises client-side in an effect |
| 3 | High | bbcode `[url]`/`[img]` accepted `javascript:`/attribute breakout; `[color]`/`[size]` allowed CSS injection | FIXED: scheme allow-list (`lib/safeUrl.ts`), quotes stripped, colour/size regex-restricted |
| 4 | High | No security headers (CSP, XFO/frame-ancestors, HSTS, Referrer/Permissions-Policy, nosniff) | FIXED: `security-headers.ts` wired in `next.config.ts`, `poweredByHeader:false` |
| 5 | High | Dependency vulns (js-yaml, nanoid, fast-uri, sharp: high) | FIXED via `npm audit fix` |
| 6 | Medium | Sanitised HTML kept `style`, forms, inputs (UI redress / phishing forms in articles, revisions, templates, previews) | FIXED: central `sanitizeHtml` forbids style/form/input/iframe/object/embed/base/meta/link; target links forced `rel=noopener noreferrer` |
| 7 | Medium | JSON-LD `</script>` breakout (`JSON.stringify` in dangerouslySetInnerHTML) | FIXED: `<`,`>`,`&`,U+2028/9 escaped |
| 8 | Medium | Open redirect: `?redirect=/\host` accepted (browsers treat as `//host`); control chars; `?tenant` unvalidated | FIXED: `safeRedirect` rejects backslash/controls; tenant must match slug regex |
| 9 | Medium | User-supplied URLs used raw as href / location.href: search result url, game binary url, profile website/github/twitter | FIXED: `safeHref` (http/https/mailto/relative only); user links `rel=noopener noreferrer ugc` |
| 10 | Medium | Turbologin clipboard JSON: `null`/array crashed, non-string fields coerced, no length cap | FIXED: object + string + length validation; only `user`/`pass` read (no prototype pollution possible; tested with `__proto__`) |
| 11 | Medium | Theme/backup JSON import: unbounded size, arbitrary keys spread into state | FIXED: size caps, `pickTheme` keeps known typed keys only |
| 12 | Medium | robots.txt did not hide `/site/*/admin`, `/super-admin`, `/auth` | FIXED. Sitemap article names now URL-encoded |
| 13 | Low | `window.open(..., '_blank')` without noopener | FIXED |
| 14 | Low | WebSocket token in query string not URL-encoded | FIXED (encoded). Query-string token itself: OPEN (needs backend ticket/subprotocol auth) |
| 15 | Medium | JWT in localStorage (`token`, `token:<slug>`) and duplicated in redux-persist (`persist:root` -> `auth.token`) | OPEN: readable by any XSS. Mitigated by CSP + sanitising above. Real fix: httpOnly SameSite cookie issued by backend (backend change) |
| 16 | Low | CSP uses `'unsafe-inline'` scripts/styles (Next inline bootstrap, MUI/emotion); Monaco loads from cdn.jsdelivr.net | OPEN: nonce-based CSP needs middleware (currently disabled) and self-hosting Monaco |
| 17 | Low | `next.config.ts` has `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` | OPEN (tsc is clean; consider turning off) |
| 18 | Low | Client-only authz: super-admin layout guard (`SuperAdminGuard`, role >= SuperAdmin) and tenant `AdminGate` verified | OK as UX gate; all enforcement must be server-side (backend) |
| 19 | Low | `console.log` of theme/menu/template objects in admin save stubs | OPEN (no secrets; remove when real save lands) |
| 20 | Info | Auth cookies not used, so CSRF is N/A for Bearer-token API; CORS is a backend concern | N/A |
| 21 | Info | react-markdown does not render raw HTML and uses safe URL transform | OK |
| 22 | Info | Media `src` (avatars, pictures) not scheme-filtered (`safeSrc` exists); modern browsers do not run `javascript:` in img | OPEN (low) |
| 23 | Low | Client-side upload checks: no type/size validation on gallery/file-manager uploads (server must enforce) | OPEN |
| 24 | Low | 1 remaining moderate `npm audit` (@tiptap/core <= 3.30.3); fix is a major upgrade | OPEN |
| 25 | Info | `.env.example` contains only public NEXT_PUBLIC_* / API URLs; no secrets. `env.API_URL` inlined is the public API base | OK |

Tests: `src/__tests__/lib/security.test.ts` (XSS vectors, url schemes, redirects,
turbologin, JSON-LD, headers, theme import).
