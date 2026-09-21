"""Multipart upload of one file through a Store."""
import re

from .s3_errors import StoreError


def upload(store, key, path):
    with store.call("POST", key, "?uploads", b"") as r:
        xml = r.read().decode()
    m = re.search(r"<UploadId>([^<]+)</UploadId>", xml)
    if not m:
        raise StoreError("no UploadId in initiate response")
    uid = m.group(1)
    try:
        with open(path, "rb") as f:
            n = 0
            while chunk := f.read(store.part):
                n += 1
                q = f"?partNumber={n}&uploadId={uid}"
                store.call("PUT", key, q, chunk).read()
        store.call("POST", key, f"?uploadId={uid}", b"").read()
    except BaseException:
        try:
            store.call("DELETE", key, f"?uploadId={uid}").read()
        except StoreError:
            pass
        raise
