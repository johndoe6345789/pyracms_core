"""Tiny S3-style object store client (stdlib only, streaming)."""
import hashlib
import re
import urllib.error
import urllib.request

CHUNK = 1 << 20
PART = 50 << 20
MULTIPART_ABOVE = 64 << 20


class StoreError(Exception):
    pass


class Store:
    def __init__(self, endpoint, bucket, access, secret, timeout=600):
        self.base = endpoint.rstrip("/") + "/" + bucket
        self.auth = f"AWS {access}:{secret}"
        self.timeout = timeout
        self.multipart_above = MULTIPART_ABOVE
        self.part = PART

    def call(self, method, key="", query="", body=None):
        url = self.base + ("/" + key if key else "") + query
        req = urllib.request.Request(url, data=body, method=method)
        req.add_header("Authorization", self.auth)
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
        self._multipart(key, path)

    def _multipart(self, key, path):
        with self.call("POST", key, "?uploads", b"") as r:
            xml = r.read().decode()
        m = re.search(r"<UploadId>([^<]+)</UploadId>", xml)
        if not m:
            raise StoreError("no UploadId in initiate response")
        uid = m.group(1)
        try:
            with open(path, "rb") as f:
                n = 0
                while chunk := f.read(self.part):
                    n += 1
                    q = f"?partNumber={n}&uploadId={uid}"
                    self.call("PUT", key, q, chunk).read()
            self.call("POST", key, f"?uploadId={uid}", b"").read()
        except BaseException:
            try:
                self.call("DELETE", key, f"?uploadId={uid}").read()
            except StoreError:
                pass
            raise

    def digest(self, key):
        """Streams the object; returns (sha256 hex, size)."""
        h, size = hashlib.sha256(), 0
        with self.call("GET", key) as r:
            while chunk := r.read(CHUNK):
                h.update(chunk)
                size += len(chunk)
        return h.hexdigest(), size
