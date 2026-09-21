"""Chunked upload of big files via /api/files/uploads (stdlib only)."""
from __future__ import annotations

import hashlib
import os
import time
import urllib.error

from hn_errors import ApiError

BIG_FILE = 40 * 1000 * 1000  # above this, use the chunked API
RETRIES = 3
BACKOFF = 1.0


def sha256_file(path, block=1 << 20):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(block):
            h.update(chunk)
    return h.hexdigest()


def put_part(client, base, n, data):
    """PUT one part, retrying 5xx and network errors with backoff."""
    for attempt in range(RETRIES):
        try:
            return client._open(
                "PUT", f"{base}/parts/{n}", data,
                {"Content-Type": "application/octet-stream"})
        except (ApiError, urllib.error.URLError, OSError) as e:
            bad = not isinstance(e, ApiError) or e.status >= 500
            if not bad or attempt == RETRIES - 1:
                raise
            time.sleep(BACKOFF * 2 ** attempt)


def upload_chunked(client, path):
    name = os.path.basename(path)
    size = os.path.getsize(path)
    init = client.request("POST", "/api/files/uploads", {
        "filename": name, "size": size, "sha256": sha256_file(path)})
    base = f"/api/files/uploads/{init['uploadId']}"
    try:
        with open(path, "rb") as f:
            n = 0
            while chunk := f.read(int(init["partSize"])):
                n += 1
                put_part(client, base, n, chunk)
        return client.request("POST", f"{base}/complete", {})
    except BaseException:
        try:
            client.request("DELETE", base)
        except Exception:
            pass
        raise
