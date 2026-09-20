# Site admin panel

Every site has an admin panel at `/site/<slug>/admin`, open to the site's
owner and to Site Administrators. Each tab below writes to a real backend
route and something else reads what it saved. Tabs that did not (ACL and
Templates) were removed rather than left as decoration.

| Tab | Controls | Stored in | Read by |
|---|---|---|---|
| Dashboard | Overview: user, content and registration state, recent activity, quick links | (read only) | - |
| Users | Accounts of this site: role, ban, password, delete | `users` | login, role checks |
| Settings | Guided site settings (below) plus an Advanced raw editor | `settings` | public site, backend |
| Feature Toggles | Which modules (articles, forum, gallery, snippets, Hypernucleus) are on | `settings` `feature_<id>` | site menu, feature pages, backend feature gate |
| Menus | Navigation menu groups and items | `menu_groups`, `menus` | public site menus |
| Files | Uploaded files: upload, list, delete | object storage + `files` | article/gallery content |
| Styles | Colors, fonts and layout of the public site | `settings` `site_theme` | `ThemeWrapper` on every page |
| Analytics | Page views, top content, traffic sources, searches | `page_views` | itself |
| Webhooks | Outgoing HTTP callbacks for content events, with delivery log | `webhooks` | webhook dispatcher |
| Audit Log | Who changed what (settings, users, content) | `audit_log` | itself |
| Backup | Export/import of settings and menus as JSON | client download / settings + menus routes | - |

## Settings

The Settings tab is a typed form. Every field is stored as one tenant
setting through `PUT /api/settings/<name>` and read back publicly through
`GET /api/settings` (credential-like names stay hidden from visitors).

| Field (setting name) | Effect |
|---|---|
| Site name (`site_name`) | Header brand, menu title, browser tab title suffix |
| Site description (`site_description`) | Text under the name in the menu; default meta description |
| Logo URL (`site_logo_url`) | `og:image` when the site is shared |
| Favicon URL (`site_favicon_url`) | Browser tab icon |
| Contact email (`contact_email`) | "Contact" mailto link in the footer |
| Default color mode (`default_theme`) | `system`, `light` or `dark` for visitors who have not picked a mode |
| Registration open (`registration_open`) | Backend refuses `POST /api/auth/register` for this site with 403 when `false` |
| Comments enabled (`comments_enabled`) | Backend refuses `POST /api/comments/...` with 403 when `false` |
| SEO title / description (`seo_title`, `seo_description`) | Home page title and description for search engines |

Missing values mean the defaults (registration and comments on, no
overrides). Titles, description, favicon and share image are rendered on
the server (`generateMetadata` in `app/site/[slug]/layout.tsx`, cached for
60 seconds); the rest is read by the browser and updates on save.
The Advanced accordion lists every raw key (including `feature_*` and
`site_theme`) for edge cases.

## Removed tabs

* **ACL**: stored a list of allow/deny rules under `acl_rules` that no
  controller ever read, so it changed nothing. Authorization is enforced by
  roles (User, Moderator, Site Admin, Owner) in `filters/`. A real
  per-capability matrix would need every controller to consult it; that is
  a separate feature, not a UI.
* **Templates**: stored header/footer HTML under `site_templates` that no
  public page rendered. Removed instead of adding an HTML-injection surface
  with no consumer.
