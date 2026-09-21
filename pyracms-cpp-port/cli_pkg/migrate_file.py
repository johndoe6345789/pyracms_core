"""Copy, verify and flip one file for migrate-storage."""
import hashlib
import os

from . import migrate_db
from .s3_store import CHUNK, StoreError


def hash_file(path):
    h, size = hashlib.sha256(), 0
    with open(path, "rb") as f:
        while chunk := f.read(CHUNK):
            h.update(chunk)
            size += len(chunk)
    return h.hexdigest(), size


def check_local(path, sha, size):
    """Returns an error text, or None when the file matches its row."""
    if not os.path.isfile(path):
        return "local file missing"
    got, n = hash_file(path)
    if n != size:
        return f"size mismatch (disk {n}, row {size})"
    if sha and got != sha:
        return "sha256 mismatch"
    return None


def copy_verified(store, key, path):
    want = hash_file(path)
    store.put_file(key, path, want[1])
    if store.digest(key) != want:
        raise StoreError(f"read-back mismatch for {key}")


def migrate_one(store, row, uploads, opts, db_env):
    """Returns an error text, or None on success."""
    uuid, tenant, sha, size = row
    path = os.path.join(uploads, uuid)
    thumb = os.path.join(uploads, "thumbnails", uuid)
    files = [(f"tenant-{tenant}-{uuid}", path)]
    if os.path.isfile(thumb):
        files.append((f"tenant-{tenant}-thumb-{uuid}", thumb))
    err = check_local(path, sha, size)
    if err or opts.dry_run:
        return err
    try:
        for key, p in files:
            copy_verified(store, key, p)
        migrate_db.mark_s3(uuid, db_env)
    except (StoreError, RuntimeError, OSError) as e:
        return str(e)
    if opts.delete_local:
        for _, p in files:
            os.remove(p)
    return None
