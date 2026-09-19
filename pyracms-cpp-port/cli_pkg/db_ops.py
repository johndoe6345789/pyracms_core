"""SQL-file application and full database reset."""
import os

from .common import CYAN, RED, RESET, YELLOW, log, run, success


def apply_sql_files(sql_dir, db_env):
    for sql_file in sorted(sql_dir.glob("*.sql")):
        log(f"Applying {sql_file.name}...")
        run(
            f"psql -f {sql_file}",
            env={**os.environ, **db_env},
            check=False
        )


def db_reset(sql_dir, db_env):
    log("Resetting database...", YELLOW)
    confirm = input(f"{RED}This will DROP and recreate the database. "
                    f"Continue? [y/N]: {RESET}")
    if confirm.lower() != 'y':
        log("Cancelled.")
        return

    db_name = db_env["PGDATABASE"]
    maint_env = {**os.environ, **db_env, "PGDATABASE": "postgres"}

    run(
        f'psql -c "DROP DATABASE IF EXISTS {db_name};"',
        env=maint_env,
        check=False
    )
    run(
        f'psql -c "CREATE DATABASE {db_name} '
        f'OWNER {db_env["PGUSER"]};"',
        env=maint_env,
        check=False
    )
    success(f"Database '{db_name}' recreated")

    # Re-run migrations
    log("Re-running migrations...", CYAN)
    apply_sql_files(sql_dir, db_env)
    success("Database reset complete")
