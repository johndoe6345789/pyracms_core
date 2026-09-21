import argparse
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from cli_pkg import user_cmd  # noqa: E402
from cli_pkg.parser import build_parser  # noqa: E402


@pytest.fixture
def psql(monkeypatch):
    calls = []

    def fake(sql, db_env):
        calls.append(sql)
        return subprocess.CompletedProcess([], 0, stdout="1\n", stderr="")

    monkeypatch.setattr(user_cmd, "run_sql", fake)
    monkeypatch.setattr(user_cmd, "check_prereq", lambda *a: True)
    monkeypatch.setenv("PYRACMS_NEW_PASSWORD", "s3cret-pass")
    return calls


def test_parser_accepts_the_command():
    ns = build_parser().parse_args(
        ["user", "set-password", "bob", "--tenant", "claude", "--yes"])
    assert (ns.username, ns.tenant, ns.yes) == ("bob", "claude", True)
    assert ns.print_sql is False


def test_print_sql_only_prints_and_never_calls_psql(psql, capsys):
    ns = argparse.Namespace(
        username="alice", tenant=None, yes=True, print_sql=True)
    user_cmd.cmd_user(ns)
    out = capsys.readouterr().out
    assert psql == []
    assert out.startswith("WITH u AS (") and "s3cret-pass" not in out
