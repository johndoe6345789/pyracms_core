"""`user` command: reset a lost password without the e-mail flow."""
import getpass
import os
import subprocess
import sys

from .common import CYAN, YELLOW, check_prereq, error, log, success
from .db_cmd import get_db_env
from .password_hash import hash_password, length_problem
from .user_sql import set_password_sql


def read_password():
    """PYRACMS_NEW_PASSWORD, else a hidden prompt asked twice."""
    env = os.environ.get("PYRACMS_NEW_PASSWORD")
    if env is not None:
        return env
    first = getpass.getpass("New password: ")
    if first != getpass.getpass("Repeat password: "):
        error("Passwords do not match")
        sys.exit(1)
    return first


def run_sql(sql, db_env):
    # The SQL (which holds the salted hash) goes over stdin, not argv.
    return subprocess.run(
        ["psql", "-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1"],
        input=sql, env={**os.environ, **db_env},
        capture_output=True, text=True)


def new_sql(args):
    """Asks for the password and returns the ready-to-run SQL."""
    password = read_password()
    problem = length_problem(password)
    if problem:
        error(problem)
        sys.exit(1)
    return set_password_sql(
        args.username, args.tenant, hash_password(password))


def cmd_user(args):
    if args.print_sql:  # for scripts/set-password.sh: stdout is only SQL
        print(new_sql(args))
        return
    if not check_prereq("psql", "psql"):
        sys.exit(1)
    db_env = get_db_env()
    who = f"{args.username} on {args.tenant or 'the platform'}"
    log(f"Resetting the password of {who} in "
        f"{db_env['PGDATABASE']}@{db_env['PGHOST']}", CYAN)
    if not args.yes and input("Continue? [y/N]: ").lower() != "y":
        log("Cancelled", YELLOW)
        return
    result = run_sql(new_sql(args), db_env)
    if result.returncode != 0:
        error(f"psql failed: {result.stderr.strip()}")
        sys.exit(1)
    if result.stdout.strip() != "1":
        error(f"No account named {who}")
        sys.exit(1)
    success("Password updated; older sessions are signed out")
