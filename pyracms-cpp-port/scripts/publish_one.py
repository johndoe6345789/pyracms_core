"""Publish a single manifest to the GameDep API."""
from __future__ import annotations

import os

from hn_deps import ensure_dep, link_dep
from publish_files import attach_binary, backend_arch, resolve_file


def publish_dep(c, type_, name, d, files_dir, os_ids, arch_ids):
    drev = ensure_dep(c, d)
    src = d.get("file") and os.path.join(files_dir or ".", d["file"])
    if src and os.path.exists(src):
        attach_binary(c, "dep", d["name"], d["version"], src,
                      ("pi", "pi", os_ids, arch_ids))
    c.ensure_published("dep", d["name"], drev)
    link_dep(c, type_, name, drev)


def publish_one(c, m, files_dir, os_ids, arch_ids):
    type_ = "game" if m["kind"] == "game" else "dep"
    name = m["name"]
    print(f"- {type_} {name} {m['version']} {m['os']}/{m['arch']}")
    c.ensure_page(type_, name, m["displayName"], m["description"])
    rev = c.ensure_revision(type_, name, m["version"],
                            m.get("moduleType", ""))
    if m.get("tags"):
        c.request("PUT", f"/api/gamedep/{type_}/{name}/tags",
                  {"tags": m["tags"]})
    ids = (m["os"], backend_arch(m["arch"]), os_ids, arch_ids)
    attach_binary(c, type_, name, m["version"],
                  resolve_file(m, files_dir), ids)
    for d in m.get("dependencies", []):
        publish_dep(c, type_, name, d, files_dir, os_ids, arch_ids)
    c.ensure_published(type_, name, rev)
