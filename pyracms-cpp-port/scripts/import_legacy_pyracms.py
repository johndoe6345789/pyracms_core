#!/usr/bin/env python3
"""Turn a backup of the old (Python/Pyramid) PyRACMS into a site on the C++ port.

Reads the old SQLite database and its static files and writes, to --out:

  import.sql        one transaction that creates the site (tenant + domain) and its
                    users, articles with every revision and tag, menu, settings,
                    gallery, code albums and file rows. Run it with psql.
  uploads/<uuid>    the files, named the way the backend's "local" storage names
                    them, ready for `cli.py migrate-storage --uploads-dir`.
  credentials.txt   a temporary password for each imported user (mode 0600). The
                    old password hashes cannot be carried over.

Nothing touches a database or the object store; review import.sql, then apply it.
Article links to /static/... files (also the old absolute host) are rewritten to
/api/files/<uuid>. Links to files the backup does not contain are left as they were
and listed on stderr.

  import_legacy_pyracms.py --sqlite pyracms.db --static rogstatic --slug rog \
      --title "Roger's Cyber Home" --domain rog.pynguins.xyz --old-host rog.pynguins.com \
      --out /tmp/rog-import
"""
import argparse
import hashlib
import mimetypes
import os
import re
import secrets
import shutil
import sqlite3
import sys
import uuid
from datetime import datetime
from urllib.parse import quote

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from cli_pkg.password_hash import hash_password  # noqa: E402

RENDERERS = {1: "html", 2: "bbcode", 3: "restructuredtext", 4: "markdown"}
GROUPS = {"admin": "admin", "article": "article", "gallery": "gallery",
          "forum_moderator": "forum_moderator", "forum": "forum"}
# Old admin/system menu groups drive Pyramid-only screens and have no counterpart.
SKIP_MENU_GROUPS = {"admin_area", "picture_admin", "article_not_revision", "user_area",
                    "article_revision", "album_admin", "main_menu", "Gallery", "cdp"}
MIN_YEAR = 1990


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("\x00", "").replace("'", "''") + "'"


def ts_exact(value, fallback=None):
    """A revision's own date, kept as it is. The old site chose the current revision by the latest
    date, and many revisions carry placeholder dates (years 1008-1274), so the order of those dates
    matters: replacing them made every revision tie and the wrong one show as current."""
    try:
        d = datetime.fromisoformat(str(value or fallback))
        return q("%04d-%02d-%02d %02d:%02d:%02d+00" % (d.year, d.month, d.day, d.hour, d.minute, d.second))
    except ValueError:
        return "NOW()"


def ts(value, fallback=None):
    """Old naive timestamps are UTC. Placeholder dates (year 1178) fall back."""
    for v in (value, fallback):
        if not v:
            continue
        try:
            d = datetime.fromisoformat(str(v))
        except ValueError:
            continue
        if d.year >= MIN_YEAR:
            return q(d.strftime("%Y-%m-%d %H:%M:%S") + "+00")
    return "NOW()"


def mapped(kind, old):
    if old is None:
        return "NULL"
    return f"(SELECT new FROM _map WHERE kind='{kind}' AND old={int(old)})"


class Importer:
    def __init__(self, a):
        self.a = a
        self.db = sqlite3.connect(a.sqlite)
        self.db.row_factory = sqlite3.Row
        self.out = []
        self.creds = []
        self.files = {}          # relpath under static -> (uuid, size, sha, mime)
        self.missing = set()

    def emit(self, sql):
        self.out.append(sql.rstrip(";") + ";")

    def insert_mapped(self, kind, old, table, cols, vals):
        self.emit(f"WITH i AS (INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)}) RETURNING id) "
                  f"INSERT INTO _map SELECT '{kind}', {int(old)}, id FROM i")

    # ---- files ------------------------------------------------------------------------
    def stage(self, path, filename, folder, user, new_uuid=None):
        data = open(path, "rb").read()
        u = new_uuid or str(uuid.uuid4())
        os.makedirs(os.path.join(self.a.out, "uploads"), exist_ok=True)
        dest = os.path.join(self.a.out, "uploads", u)
        with open(dest, "wb") as f:
            f.write(data)
        sha = hashlib.sha256(data).hexdigest()
        mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        self.emit(
            "INSERT INTO files (filename, uuid, mimetype, size, is_picture, is_video, sha256, user_id, tenant_id, storage, folder, visibility) "
            f"VALUES ({q(filename[:256])}, {q(u)}, {q(mime)}, {len(data)}, {q(mime.startswith('image/'))}, "
            f"{q(mime.startswith('video/') or filename.lower().endswith(('.flv', '.mp4', '.webm')))}, {q(sha)}, {user}, "
            f"(SELECT tid FROM _ctx), 'local', {q(folder)}, 'public')")
        return u, len(data), sha, mime

    # ---- sections ---------------------------------------------------------------------
    def site(self):
        a = self.a
        self.emit("CREATE TEMP TABLE _map (kind text, old bigint, new bigint)")
        self.emit(f"INSERT INTO tenants (slug, display_name, description, primary_domain) VALUES ({q(a.slug)}, {q(a.title)}, {q(a.description)}, {q(a.domain)}) ON CONFLICT (slug) DO NOTHING")
        self.emit(f"CREATE TEMP TABLE _ctx AS SELECT id AS tid FROM tenants WHERE slug = {q(a.slug)}")
        self.emit(f"INSERT INTO tenant_domains (tenant_id, domain, display_mode, display_mode_description) "
                  f"SELECT tid, {q(a.domain)}, 'single', {q('Single-site mode: only shows ' + a.title + ' content')} FROM _ctx ON CONFLICT (domain) DO NOTHING")

    def users(self):
        groups = {r["id"]: r["name"] for r in self.db.execute('SELECT id, name FROM "group"')}
        member_of = {}
        for r in self.db.execute("SELECT user_id, group_id FROM user_group"):
            member_of.setdefault(r["user_id"], set()).add(groups.get(r["group_id"]))
        first = True
        for u in self.db.execute("SELECT * FROM user ORDER BY id"):
            if u["banned"] and u["name"].startswith("system."):
                continue                      # the old anonymous pseudo-user
            admin = "admin" in member_of.get(u["id"], ())
            password = secrets.token_urlsafe(12)
            self.creds.append(f"{u['name']}\t{password}\t{u['email_address']}")
            self.insert_mapped("user", u["id"], "users",
                ["username", "full_name", "email", "password_hash", "website", "birthday", "sex", "aboutme", "created_at",
                 "banned", "timezone", "post_count", "signature", "tenant_id", "role", "is_first"],
                [q(u["name"]), q(u["full_name"]), q(u["email_address"]), q(hash_password(password)), q(u["website"]),
                 q(u["birthday"]), q(u["sex"]), q(u["aboutme"]), ts(u["created"]), q(bool(u["banned"])), q(u["timezone"]),
                 q(u["postcount"] or 0), q(u["signature"]), "(SELECT tid FROM _ctx)", "3" if admin else "1", q(first and admin)])
            first = first and not admin
            self.emit(f"INSERT INTO tenant_members (tenant_id, user_id, role) SELECT (SELECT tid FROM _ctx), {mapped('user', u['id'])}, {q('admin' if admin else 'member')}")
            for g in member_of.get(u["id"], ()):
                if g in GROUPS:
                    self.emit(f"INSERT INTO user_groups (user_id, group_id) SELECT {mapped('user', u['id'])}, id FROM groups WHERE name = {q(GROUPS[g])} ON CONFLICT DO NOTHING")

    def collect_files(self):
        """Stage every static file an article refers to, and the gallery uploads."""
        text = "\n".join(r[0] for r in self.db.execute("SELECT article FROM articlerevision"))
        root = self.a.static
        for dirpath, dirs, names in os.walk(root):
            rel_dir = os.path.relpath(dirpath, root)
            if rel_dir == "uploads" or rel_dir.startswith("uploads" + os.sep):
                dirs[:] = []
                continue
            for n in names:
                rel = n if rel_dir == "." else os.path.join(rel_dir, n)
                rel = rel.replace(os.sep, "/")
                if "/static/" + rel in text or "/static/" + quote(rel) in text or "/static/" + rel.replace(" ", "%20") in text:
                    self.files[rel] = self.stage(os.path.join(root, rel), n, os.path.dirname(rel), "NULL")
        # What the old static paths were never found on disk:
        for m in set(re.findall(r"/static/([^\s>)\"'`\]]+)", text)):
            p = m.replace("%20", " ")
            if not any(p == k or p.startswith(k) for k in self.files) and not os.path.exists(os.path.join(root, p)):
                self.missing.add(m)

    def rewrite(self, text):
        hosts = r"(?:https?://" + re.escape(self.a.old_host) + r")?" if self.a.old_host else ""
        keys = sorted(self.files, key=len, reverse=True)
        for rel in keys:
            u = self.files[rel][0]
            for variant in {rel, quote(rel), rel.replace(" ", "%20")}:
                text = re.sub(hosts + "/static/" + re.escape(variant) + r"(?![\w.])", f"/api/files/{u}", text)
        return text

    def articles(self):
        authors = "(SELECT tid FROM _ctx)"
        for p in self.db.execute("SELECT * FROM articlepage ORDER BY id"):
            revs = self.db.execute("SELECT * FROM articlerevision WHERE page_id=? ORDER BY id", (p["id"],)).fetchall()
            renderer = RENDERERS.get(p["renderer_id"], "markdown")
            real = sorted(r["created"] for r in revs if str(r["created"])[:4] >= "2000")
            first = ts(p["created"], real[0] if real else None) if not real else ts(real[0])
            self.insert_mapped("article", p["id"], "articles",
                ["tenant_id", "name", "display_name", "is_private", "hide_display_name", "user_id", "renderer_id", "renderer_name",
                 "view_count", "created_at", "status", "published_at"],
                [authors, q(p["name"]), q(p["display_name"] or p["name"]), q(bool(p["private"])), q(bool(p["hide_display_name"])),
                 mapped("user", p["user_id"]), f"(SELECT id FROM article_renderers WHERE name = {q(renderer.upper())})", q(renderer),
                 q(p["view_count"] or 0), first, "'published'", first])
            for r in revs:
                self.emit("INSERT INTO article_revisions (article_id, content, summary, user_id, created_at) VALUES "
                          f"({mapped('article', p['id'])}, {q(self.rewrite(r['article'] or ''))}, {q(r['summary'] or '')}, "
                          f"{mapped('user', r['user_id'])}, {ts_exact(r['created'], p['created'])})")
            for t in self.db.execute("SELECT name FROM articletags WHERE page_id=?", (p["id"],)):
                self.emit(f"INSERT INTO article_tags (name, article_id) VALUES ({q(t['name'])}, {mapped('article', p['id'])})")

    def gallery(self):
        albums = self.db.execute(
            "SELECT a.* FROM galleryalbum a WHERE EXISTS (SELECT 1 FROM gallerypicture p WHERE p.album_id = a.id)").fetchall()
        for al in albums:
            self.insert_mapped("album", al["id"], "gallery_albums",
                ["tenant_id", "display_name", "description", "created_at", "is_private", "is_protected", "user_id"],
                ["(SELECT tid FROM _ctx)", q(al["display_name"] or "Gallery"), q(al["description"] or ""), ts(al["created"]),
                 q(bool(al["private"])), q(bool(al["protected"])), mapped("user", al["user_id"])])
        for pic in self.db.execute("SELECT * FROM gallerypicture ORDER BY id"):
            f = self.db.execute("SELECT * FROM files WHERE id=?", (pic["file_id"],)).fetchone()
            if not f:
                continue
            src = os.path.join(self.a.static, "uploads", f["uuid"], f["name"])
            if not os.path.isfile(src):
                self.missing.add(f"uploads/{f['uuid']}/{f['name']}")
                continue
            u, *_ = self.stage(src, f["name"], "gallery", mapped("user", pic["user_id"]), new_uuid=f["uuid"])
            self.emit("INSERT INTO gallery_pictures (display_name, description, created_at, is_private, album_id, file_id, file_uuid, user_id) VALUES "
                      f"({q(pic['display_name'] or f['name'])}, {q(pic['description'] or '')}, {ts(pic['created'])}, {q(bool(pic['private']))}, "
                      f"{mapped('album', pic['album_id'])}, (SELECT id FROM files WHERE uuid = {q(u)}), {q(u)}, {mapped('user', pic['user_id'])})")
        self.emit("UPDATE gallery_albums SET default_picture_id = (SELECT min(id) FROM gallery_pictures WHERE album_id = gallery_albums.id) "
                  "WHERE tenant_id = (SELECT tid FROM _ctx) AND default_picture_id IS NULL")

    def code(self):
        """The old code albums/objects are the new code snippets; the album name becomes a tag."""
        author = "(SELECT id FROM users WHERE tenant_id = (SELECT tid FROM _ctx) ORDER BY id LIMIT 1)"
        for al in self.db.execute("SELECT * FROM codealbum ORDER BY id"):
            if (al["display_name"] or "").startswith("Dummy"):
                continue
            for o in self.db.execute("SELECT * FROM codeobject WHERE album_id=? ORDER BY id", (al["id"],)):
                when = ts(o["created"], al["created"])
                self.emit(f"WITH s AS (INSERT INTO code_snippets (tenant_id, author_id, title, code, language, visibility, created_at, updated_at) VALUES "
                          f"((SELECT tid FROM _ctx), {author}, {q((o['display_name'] or 'Untitled')[:255])}, {q(o['code'] or '')}, 'python', 'public', {when}, {when}) RETURNING id) "
                          f"INSERT INTO snippet_tags (snippet_id, name) SELECT id, {q((al['display_name'] or '')[:64])} FROM s")

    def settings(self):
        wanted = {"TITLE", "KEYWORDS", "DESCRIPTION", "DEFAULTRENDERER", "CSS"}
        for s in self.db.execute("SELECT name, value FROM settings"):
            if s["name"] in wanted:
                self.emit(f"INSERT INTO settings (tenant_id, name, value) VALUES ((SELECT tid FROM _ctx), {q(s['name'])}, {q(s['value'])})")

    def menu(self):
        self.insert_mapped("mgroup", 1, "menu_groups", ["tenant_id", "name"], ["(SELECT tid FROM _ctx)", "'main'"])
        pos = 0

        def item(name, route, parent=None, kind="route"):
            nonlocal pos
            pos += 1
            self.emit("INSERT INTO menu_items (name, route_path, url, type, group_id, position, permissions, parent_id, icon) VALUES "
                      f"({q(name)}, {q(route if kind == 'route' else '')}, {q(route if kind == 'url' else '')}, {q(kind)}, "
                      f"{mapped('mgroup', 1)}, {pos}, 'public', {parent or 'NULL'}, '')")

        item("Home", "/")
        item("Articles", "/articles")
        item("Gallery", "/gallery")
        item("Code", "/snippets")
        groups = {g["id"]: g["name"] for g in self.db.execute("SELECT * FROM menugroup")}
        import json
        for gid, gname in groups.items():
            if gname in SKIP_MENU_GROUPS:
                continue
            rows = self.db.execute("SELECT * FROM menu WHERE group_id=? ORDER BY position", (gid,)).fetchall()
            links = []
            for m in rows:
                try:
                    args = json.loads(m["route_json"] or "{}")
                except ValueError:
                    args = {}
                if m["route_name"] == "article_read" and args.get("page_id"):
                    links.append((m["name"], "/articles/" + quote(args["page_id"], safe="")))
                elif m["route_name"] == "pycode_show":
                    links.append((m["name"], "/snippets"))
            if not links:
                continue
            if len(links) == 1:
                item(*links[0])
                continue
            pos += 1
            self.insert_mapped("folder", gid, "menu_items", ["name", "route_path", "url", "type", "group_id", "position", "permissions", "icon"],
                               [q(gname), "''", "''", "'folder'", mapped("mgroup", 1), str(pos), "'public'", "''"])
            for name, route in links:
                item(name, route, parent=mapped("folder", gid))

    def run(self):
        os.makedirs(self.a.out, exist_ok=True)
        self.emit("SET client_min_messages = warning")
        self.site()
        self.users()
        self.collect_files()
        self.articles()
        self.gallery()
        self.code()
        self.settings()
        self.menu()
        with open(os.path.join(self.a.out, "import.sql"), "w") as f:
            f.write("BEGIN;\n" + "\n".join(self.out) + "\nCOMMIT;\n")
        cred = os.path.join(self.a.out, "credentials.txt")
        with open(cred, "w") as f:
            f.write("username\ttemporary password\temail\n" + "\n".join(self.creds) + "\n")
        os.chmod(cred, 0o600)
        print(f"{len(self.out)} statements; {len(self.files)} static files + gallery uploads staged", file=sys.stderr)
        if self.missing:
            print("not in the backup, links left as they were:\n  " + "\n  ".join(sorted(self.missing)), file=sys.stderr)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--sqlite", required=True)
    p.add_argument("--static", required=True, help="the old site's static directory")
    p.add_argument("--slug", required=True)
    p.add_argument("--title", required=True)
    p.add_argument("--domain", required=True)
    p.add_argument("--description", default="")
    p.add_argument("--old-host", default="", help="the site's old hostname, whose absolute /static links are rewritten too")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    if os.path.exists(os.path.join(a.out, "uploads")):
        shutil.rmtree(os.path.join(a.out, "uploads"))
    Importer(a).run()


if __name__ == "__main__":
    main()
