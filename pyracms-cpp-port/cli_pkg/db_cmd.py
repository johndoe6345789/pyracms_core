"""`db` command: migrate, seed and reset the PostgreSQL database."""
import os
import subprocess
import sys

from .common import CYAN, ROOT, check_prereq, error, log, success
from .db_ops import apply_sql_files, db_reset
from .db_seed import SEED_SQL


def get_db_env():
    return {
        "PGHOST": os.environ.get("DB_HOST", "localhost"),
        "PGPORT": os.environ.get("DB_PORT", "5433"),
        "PGDATABASE": os.environ.get("DB_NAME", "pyracms"),
        "PGUSER": os.environ.get("DB_USER", "pyracms"),
        "PGPASSWORD": os.environ.get("DB_PASSWORD", "pyracms"),
    }


def db_migrate(sql_dir, db_env):
    log("Running database migrations...", CYAN)
    apply_sql_files(sql_dir, db_env)
    success("Migrations complete")


def db_seed(db_env):
    # Dev-only: inserts a well-known admin account. Never run in prod.
    if (os.environ.get("SEED_DEV") != "1"
            or os.environ.get("PYRACMS_ENV") == "production"):
        error("db seed creates a known admin account (dev only). "
              "Set SEED_DEV=1 to confirm; "
              "refused when PYRACMS_ENV=production.")
        sys.exit(1)
    log("Seeding database with sample data...", CYAN)
    result = subprocess.run(
        "psql",
        input=SEED_SQL,
        shell=False,
        env={**os.environ, **db_env},
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        error(f"Seed failed: {result.stderr}")
    else:
        success("Database seeded")


def cmd_db(args):
    if not check_prereq("psql", "psql"):
        sys.exit(1)

    db_env = get_db_env()
    sql_dir = ROOT / "backend" / "sql"

    if args.action == "migrate":
        db_migrate(sql_dir, db_env)
    elif args.action == "seed":
        db_seed(db_env)
    elif args.action == "reset":
        db_reset(sql_dir, db_env)
    else:
        error(f"Unknown db action: {args.action}")
        sys.exit(1)
