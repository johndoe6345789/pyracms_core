"""Tiny S3-style object store client (stdlib only, streaming)."""
import hashlib
import os
import urllib.error
import urllib.request
from urllib.parse import quote

from . import s3_multipart, sigv4_req
from .s3_errors import StoreError

CHUNK = 1 << 20
PART = 50 << 20
MULTIPART_ABOVE = 64 << 20


class Store:
    def __init__(self, endpoint, bucket, access, secret, timeout=600,
                 region=None):
        self.base = endpoint.rstrip("/") + "/" + bucket
        self.key = (access, secret,
                    region or os.environ.get("S3_REGION") or "us-east-1")
        self.timeout = timeout
        self.multipart_above = MULTIPART_ABOVE
        self.part = PART

    def call(self, method, key="", query="", body=None):
        url = self.base + ("/" + quote(key, safe="/-_.~") if key else "")
        url += query
        req = urllib.request.Request(url, data=body, method=method)
        hdrs = sigv4_req.signed_headers(self.key, method, url, body or b"")
        for k, v in hdrs.items():
            req.add_header(k, v)
        if body is not None:
            req.add_header("Content-Length", str(len(body)))
            req.add_header("Content-Type", "application/octet-stream")
        try:
            return urllib.request.urlopen(req, timeout=self.timeout)
        except urllib.error.HTTPError as e:
            if method == "PUT" and not key and e.code == 409:
                return e
            raise StoreError(f"{method} {key or '/'}: HTTP {e.code}")
        except OSError as e:
            raise StoreError(f"{method} {key or '/'}: {e}")

    def make_bucket(self):
        self.call("PUT").read()

    def put_file(self, key, path, size):
        if size <= self.multipart_above:
            with open(path, "rb") as f:
                self.call("PUT", key, body=f.read()).read()
            return
        s3_multipart.upload(self, key, path)

    def digest(self, key):
        """Streams the object; returns (sha256 hex, size)."""
        h, size = hashlib.sha256(), 0
        with self.call("GET", key) as r:
            while chunk := r.read(CHUNK):
                h.update(chunk)
                size += len(chunk)
        return h.hexdigest(), size
