"""`migrate-storage`: move local uploads into the object store."""
import os
import sys

from . import migrate_db
from .common import CYAN, error, log, success
from .db_cmd import get_db_env
from .migrate_file import migrate_one
from .s3_store import Store


def make_store():
    need = ("S3_ENDPOINT", "S3_ACCESS_KEY", "S3_SECRET_KEY")
    missing = [k for k in need if not os.environ.get(k)]
    if missing:
        error("missing env: " + ", ".join(missing))
        sys.exit(1)
    e = os.environ
    return Store(e["S3_ENDPOINT"], e.get("S3_BUCKET", "pyracms"),
                 e["S3_ACCESS_KEY"], e["S3_SECRET_KEY"])


def cmd_migrate_storage(args, store=None):
    uploads = args.uploads_dir or os.environ.get(
        "UPLOAD_DIR", "/app/uploads")
    db_env = get_db_env()
    store = store or make_store()
    rows = migrate_db.local_rows(db_env)
    log(f"{len(rows)} local file(s) in {uploads}", CYAN)
    if rows and not args.dry_run:
        store.make_bucket()
    ok = failed = 0
    for row in rows:
        err = migrate_one(store, row, uploads, args, db_env)
        if err:
            failed += 1
            error(f"FAILED {row[0]}: {err}")
        else:
            ok += 1
            log(("would migrate " if args.dry_run else "migrated ")
                + row[0])
    msg = f"{ok} ok, {failed} failed" + (" (dry run)" * args.dry_run)
    if failed:
        error(msg)
        sys.exit(1)
    success(msg)
