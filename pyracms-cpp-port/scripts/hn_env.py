"""Build an authenticated Client from environment variables."""
from __future__ import annotations

import os

from hn_api import Client


def env_client(env=os.environ):
    """Return a Client, or None when the environment is not configured.

    HN_API_URL plus HN_API_TOKEN or HN_API_USERNAME/HN_API_PASSWORD
    (+ optional HN_API_TENANT; site owners have no tenant).
    """
    url = env.get("HN_API_URL", "").strip()
    if not url:
        return None
    c = Client(url, env.get("HN_API_TOKEN") or None)
    if not c.token:
        if not (env.get("HN_API_USERNAME") and env.get("HN_API_PASSWORD")):
            return None
        c.login(env["HN_API_USERNAME"], env["HN_API_PASSWORD"],
                env.get("HN_API_TENANT") or None)
    return c
