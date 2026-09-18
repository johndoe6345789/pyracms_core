"""Test doubles: a scripted urlopen and a recording API client."""
import io
import json
import urllib.error


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def http_error(code, body="boom"):
    return urllib.error.HTTPError("http://x", code, "err", {},
                                  io.BytesIO(body.encode()))


class FakeUrlopen:
    """Callable replacing urllib.request.urlopen; replays `script`."""

    def __init__(self, script):
        self.script = list(script)
        self.requests = []

    def __call__(self, req, timeout=None):
        self.requests.append(req)
        item = self.script.pop(0)
        if isinstance(item, Exception):
            raise item
        raw = b"" if item is None else json.dumps(item).encode()
        return FakeResponse(raw)


class FakeClient:
    """Records request() calls; every ensure_* just logs."""

    def __init__(self):
        self.calls = []
        self.uploads = []
        self.fail = {}

    def request(self, method, path, body=None):
        self.calls.append((method, path, body))
        if (method, path) in self.fail:
            raise self.fail[(method, path)]
        return {}

    def ensure_page(self, type_, name, display, description):
        self.calls.append(("page", type_, name))

    def ensure_revision(self, type_, name, version, module_type=""):
        self.calls.append(("rev", type_, name, version))
        return {"id": 7, "version": version, "published": False}

    def ensure_published(self, type_, name, rev):
        self.calls.append(("publish", type_, name))

    def upload_file(self, path):
        self.uploads.append(path)
        return {"uuid": "u1"}

    def file_id(self, uuid_):
        return 42

    def lookup(self, kind):
        return {"win": 1, "lin": 2, "mac": 3, "pi": 4, "x86_64": 1,
                "arm": 2}
