"""Tiny stdlib-only client for the PyraCMS GameDep API (used by publish_manifest.py / seed_games.py).

Endpoints used (see backend GameDepController / FileController):
  POST /api/auth/login                       {username,password[,tenant]} -> {token}
  GET  /api/gamedep/{type}/{name}            -> page + revisions[]
  POST /api/gamedep/{type}                   {name,displayName,description}
  POST /api/gamedep/{type}/{name}/revisions  {version,moduleType} -> {id}
  POST .../revisions/{ver}/publish           toggles the published flag
  POST .../revisions/{ver}/binaries          {osId,archId,fileId}
  POST .../revisions/{ver}/source            {fileId}
  POST .../dependencies                      {depRevisionId}
  PUT  .../tags                              {tags:[...]}
  POST /api/files (multipart) ; GET /api/files?limit&offset -> [{id,uuid,...}]
"""
from __future__ import annotations

import json
import mimetypes
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid


class ApiError(RuntimeError):
    def __init__(self, status, body):
        super().__init__(f"HTTP {status}: {body}")
        self.status, self.body = status, body


class Client:
    def __init__(self, base_url: str, token: str | None = None, timeout: int = 300):
        self.base = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout

    # -- transport ---------------------------------------------------------
    def _open(self, method, path, data=None, headers=None):
        h = {"Accept": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        h.update(headers or {})
        req = urllib.request.Request(self.base + path, data=data, method=method, headers=h)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                raw = r.read()
        except urllib.error.HTTPError as e:
            raise ApiError(e.code, e.read().decode("utf-8", "replace")) from None
        return json.loads(raw) if raw else {}

    def request(self, method, path, body=None):
        data = None if body is None else json.dumps(body).encode()
        return self._open(method, path, data, {"Content-Type": "application/json"} if data else None)

    def upload_file(self, path: str) -> dict:
        boundary = uuid.uuid4().hex
        name = os.path.basename(path)
        ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
        head = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{name}\"\r\n"
                f"Content-Type: {ctype}\r\n\r\n").encode()
        tail = f"\r\n--{boundary}--\r\n".encode()
        with open(path, "rb") as f:  # binaries are tens of MB; fine to hold in memory
            data = head + f.read() + tail
        return self._open("POST", "/api/files", data,
                          {"Content-Type": f"multipart/form-data; boundary={boundary}"})

    # -- auth --------------------------------------------------------------
    def login(self, username, password, tenant=None):
        body = {"username": username, "password": password}
        if tenant:
            body["tenant"] = tenant
        self.token = self.request("POST", "/api/auth/login", body)["token"]
        return self.token

    # -- helpers -----------------------------------------------------------
    def lookup(self, kind: str) -> dict:
        """name -> id for 'operating-systems' or 'architectures'."""
        return {i["name"]: i["id"] for i in self.request("GET", f"/api/{kind}")}

    def file_id(self, uuid_: str) -> int:
        offset = 0
        while True:
            page = self.request("GET", f"/api/files?limit=200&offset={offset}")
            for f in page:
                if f["uuid"] == uuid_:
                    return f["id"]
            if len(page) < 200:
                raise ApiError(404, f"uploaded file {uuid_} not found in /api/files")
            offset += 200

    def get_page(self, type_, name):
        try:
            return self.request("GET", f"/api/gamedep/{type_}/{urllib.parse.quote(name)}")
        except ApiError as e:
            if e.status == 404:
                return None
            raise

    def ensure_page(self, type_, name, display, description):
        page = self.get_page(type_, name)
        if page is None:
            self.request("POST", f"/api/gamedep/{type_}",
                         {"name": name, "displayName": display, "description": description})
            page = self.get_page(type_, name)
        return page

    def ensure_revision(self, type_, name, version, module_type=""):
        """Returns the revision dict (id, version, published...)."""
        page = self.get_page(type_, name)
        for r in page.get("revisions", []):
            if r["version"] == version:
                return r
        self.request("POST", f"/api/gamedep/{type_}/{urllib.parse.quote(name)}/revisions",
                     {"version": version, "moduleType": module_type})
        for r in self.get_page(type_, name)["revisions"]:
            if r["version"] == version:
                return r
        raise ApiError(500, f"revision {version} not visible after creation")

    def ensure_published(self, type_, name, rev):
        if not rev.get("published"):
            self.request("POST", f"/api/gamedep/{type_}/{urllib.parse.quote(name)}"
                                 f"/revisions/{urllib.parse.quote(rev['version'])}/publish", {})


def env_client(env=os.environ):
    """Build an authenticated Client from environment, or return None when not configured.

    HN_API_URL plus either HN_API_TOKEN or HN_API_USERNAME/HN_API_PASSWORD (+ optional HN_API_TENANT;
    site owners are platform accounts with no tenant, so leave it unset for them).
    """
    url = env.get("HN_API_URL", "").strip()
    if not url:
        return None
    c = Client(url, env.get("HN_API_TOKEN") or None)
    if not c.token:
        if not (env.get("HN_API_USERNAME") and env.get("HN_API_PASSWORD")):
            return None
        c.login(env["HN_API_USERNAME"], env["HN_API_PASSWORD"], env.get("HN_API_TENANT") or None)
    return c
