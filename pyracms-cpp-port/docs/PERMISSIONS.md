# Permissions

PyraCMS has five user levels and one fixed set of defaults. There is no
configurable ACL: the same rules apply on every site, and the backend
enforces them (the UI only hides what would be refused).

| Level | Who |
|---|---|
| **Guest** | Not signed in on this site |
| **Normal User** | Registered on the site |
| **Moderator** | Trusted member who looks after content |
| **Administrator** | Runs the site. The **site owner** is always the Administrator of their site, whatever level is stored |
| **Platform Owner** | Runs the whole platform, across all sites |

Accounts belong to one site. Being a Moderator on site A gives no power on
site B; only a Platform Owner reaches across sites.

## How accounts are created

There is exactly one way to get each kind of account:

| You want | How |
|---|---|
| The **Platform Owner** | First visit to a new install shows a **setup screen**: choose a username, email and password. It works once; after that the screen redirects home. |
| A site **Administrator** | **Create a site** (`/create-site`): the form also asks for the admin account. Creating a site creates that account, on that site only, and signs you in to it. |
| A **Normal User** | **Register on a site**. Registering always gives a Normal User, never more, even for the first person to register. |
| A **Moderator** | Only through the site **admin panel** (Users, change level). Nobody becomes a moderator by signing up. |

Consequences:

* The portal has no public sign-up. Its register page tells people to sign up
  on a site. Signing in with an OAuth provider only works for an already
  linked account; it never creates one.
* At **sign-in**, the login page has a *Sign in as* dropdown: Platform Owner,
  or any site. The Platform Owner lands on the portal home; a site account
  lands on its site.
* Accounts are separate on every site: `richard` on site A is not `richard`
  on site B, and signing out of one site does not sign out of another.

## What each level can do

| | Guest | User | Moderator | Administrator | Platform Owner |
|---|:-:|:-:|:-:|:-:|:-:|
| Read public articles, forum, gallery, snippets, games | yes | yes | yes | yes | yes |
| Download public games and the launcher | yes | yes | yes | yes | yes |
| Search, browse tags | yes | yes | yes | yes | yes |
| Comment, react, vote | | yes | yes | yes | yes |
| Start forum threads and reply | | yes | yes | yes | yes |
| Create snippets, albums, uploads (own) | | yes | yes | yes | yes |
| Edit or delete **own** posts, comments, snippets | | yes | yes | yes | yes |
| See own drafts and private items | | yes | yes | yes | yes |
| Write and publish articles | | | yes | yes | yes |
| Edit any article, gallery item, forum post | | | yes | yes | yes |
| Delete any comment, snippet, forum post | | | yes | yes | yes |
| Pin, lock and move forum threads | | | yes | yes | yes |
| Site admin panel: settings, menus, styles, features | | | | yes | yes |
| Users: change levels, ban, delete | | | | yes | yes |
| Webhooks, files, backup, analytics, audit log | | | | yes | yes |
| Create, suspend or delete sites | | | | | yes |

Notes:

* Moderators delete other people's comments and snippets, but cannot rewrite
  them: editing someone else's words is not offered.
* Moderation is always **within one site**: a Moderator of another site, or
  an account from another site, is refused.
* A Platform Owner level cannot be granted through the site Users page.
* Level changes follow the lock-out rules: nobody changes their own level,
  the site owner is protected, and the last Administrator of a site cannot
  be demoted, banned or deleted.
* A site can switch whole features off (Feature Toggles); a switched-off
  feature is closed to everyone on that site.

## Where it lives

* Backend: `AdminFilter`, `OwnerFilter` / `OwnerRules.h`,
  `ArticleWriteGate`, `UserAdminRules.h`, and the tenant-aware moderation
  rule in `services/ModerationSql.h`.
* Frontend: `lib/permissions.ts` (the table) and `hooks/usePermissions.ts`.
