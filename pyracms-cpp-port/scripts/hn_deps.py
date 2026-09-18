"""Helpers for custom (non-pip) dependency pages."""
from __future__ import annotations

from hn_errors import ApiError


def ensure_dep(c, d):
    """Ensure the 'dep' page and revision for a game.json dependency."""
    name = d["name"]
    c.ensure_page("dep", name, d.get("displayName", name),
                  d.get("description", ""))
    return c.ensure_revision("dep", name, d["version"],
                             d.get("moduleType", "python-package"))


def link_dep(c, type_, name, drev):
    """Link a dep revision to a page; an existing link is fine."""
    try:
        c.request("POST", f"/api/gamedep/{type_}/{name}/dependencies",
                  {"depRevisionId": drev["id"]})
    except ApiError as e:
        if e.status not in (400, 409):
            raise
