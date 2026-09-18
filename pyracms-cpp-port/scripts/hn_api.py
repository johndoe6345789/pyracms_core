"""Tiny stdlib-only client for the PyraCMS GameDep API.

Endpoints: /api/auth/login, /api/gamedep/{type}[/{name}[/revisions]],
.../revisions/{ver}/(publish|binaries), .../dependencies, .../tags,
/api/files (multipart upload + paged listing).
"""
from __future__ import annotations

import urllib.parse

from hn_errors import ApiError
from hn_http import HttpClient

__all__ = ["ApiError", "Client"]
PAGE = 200


def q(text):
    return urllib.parse.quote(text)


class Client(HttpClient):
    def lookup(self, kind):
        """name -> id for 'operating-systems' or 'architectures'."""
        return {i["name"]: i["id"] for i in self.request("GET", f"/api/{kind}")}

    def file_id(self, uuid_):
        offset = 0
        while True:
            page = self.request(
                "GET", f"/api/files?limit={PAGE}&offset={offset}")
            for f in page:
                if f["uuid"] == uuid_:
                    return f["id"]
            if len(page) < PAGE:
                raise ApiError(404, f"uploaded file {uuid_} not found")
            offset += PAGE

    def get_page(self, type_, name):
        try:
            return self.request("GET", f"/api/gamedep/{type_}/{q(name)}")
        except ApiError as e:
            if e.status == 404:
                return None
            raise

    def ensure_page(self, type_, name, display, description):
        page = self.get_page(type_, name)
        if page is None:
            self.request("POST", f"/api/gamedep/{type_}",
                         {"name": name, "displayName": display,
                          "description": description})
            page = self.get_page(type_, name)
        return page

    def _find_revision(self, type_, name, version):
        for r in (self.get_page(type_, name) or {}).get("revisions", []):
            if r["version"] == version:
                return r
        return None

    def ensure_revision(self, type_, name, version, module_type=""):
        """Returns the revision dict (id, version, published...)."""
        rev = self._find_revision(type_, name, version)
        if rev:
            return rev
        self.request("POST", f"/api/gamedep/{type_}/{q(name)}/revisions",
                     {"version": version, "moduleType": module_type})
        rev = self._find_revision(type_, name, version)
        if rev is None:
            raise ApiError(500, f"revision {version} missing after create")
        return rev

    def ensure_published(self, type_, name, rev):
        if not rev.get("published"):
            self.request("POST", f"/api/gamedep/{type_}/{q(name)}"
                                 f"/revisions/{q(rev['version'])}/publish",
                         {})
