"""Register one games/*/game.json with the backend."""
from __future__ import annotations

from hn_deps import ensure_dep, link_dep


def register_game(c, g):
    """Create page, revision, tags and custom deps; publish the revision."""
    name = g["name"]
    c.ensure_page("game", name, g["displayName"], g["description"])
    rev = c.ensure_revision("game", name, g["version"],
                            g.get("moduleType", "python"))
    c.request("PUT", f"/api/gamedep/game/{name}/tags",
              {"tags": g.get("tags", [])})
    for d in g.get("dependencies", []):
        drev = ensure_dep(c, d)
        c.ensure_published("dep", d["name"], drev)
        link_dep(c, "game", name, drev)
    c.ensure_published("game", name, rev)
    pip = ", ".join(g.get("pipRequirements", [])) or "-"
    return f"registered {name} {g['version']} (pip: {pip})"
