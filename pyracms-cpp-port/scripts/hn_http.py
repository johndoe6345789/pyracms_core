"""Minimal JSON-over-HTTP transport for the PyraCMS API (stdlib only)."""
from __future__ import annotations

import json
import urllib.error
import urllib.request

from hn_errors import ApiError
from hn_multipart import encode_file


class HttpClient:
    def __init__(self, base_url, token=None, timeout=300):
        self.base = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout

    def _open(self, method, path, data=None, headers=None):
        h = {"Accept": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        h.update(headers or {})
        req = urllib.request.Request(self.base + path, data=data,
                                     method=method, headers=h)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                raw = r.read()
        except urllib.error.HTTPError as e:
            raise ApiError(e.code, e.read().decode("utf-8", "replace")) \
                from None
        return json.loads(raw) if raw else {}

    def request(self, method, path, body=None):
        if body is None:
            return self._open(method, path)
        return self._open(method, path, json.dumps(body).encode(),
                          {"Content-Type": "application/json"})

    def upload_file(self, path):
        data, ctype = encode_file(path)
        return self._open("POST", "/api/files", data,
                          {"Content-Type": ctype})

    def login(self, username, password, tenant=None):
        body = {"username": username, "password": password}
        if tenant:
            body["tenant"] = tenant
        self.token = self.request("POST", "/api/auth/login", body)["token"]
        return self.token
