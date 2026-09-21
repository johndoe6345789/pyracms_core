import argparse
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from cli_pkg import user_cmd  # noqa: E402
from cli_pkg.password_hash import verify_password  # noqa: E402


def args(**kw):
    base = dict(username="alice", tenant=None, yes=True, print_sql=False)
    return argparse.Namespace(**{**base, **kw})


@pytest.fixture
def psql(monkeypatch):
    calls = []
    out = {"stdout": "1\n", "returncode": 0, "stderr": ""}

    def fake(sql, db_env):
        calls.append(sql)
        return subprocess.CompletedProcess([], **out)

    monkeypatch.setattr(user_cmd, "run_sql", fake)
    monkeypatch.setattr(user_cmd, "check_prereq", lambda *a: True)
    monkeypatch.setenv("PYRACMS_NEW_PASSWORD", "s3cret-pass")
    return calls, out


def test_writes_a_hash_the_backend_can_verify(psql, capsys):
    calls, _ = psql
    user_cmd.cmd_user(args())
    stored = calls[0].split("password_hash = '")[1].split("'")[0]
    assert verify_password("s3cret-pass", stored)
    assert "s3cret-pass" not in calls[0]
    assert "signed out" in capsys.readouterr().out


def test_unknown_account_fails(psql, capsys):
    _, out = psql
    out["stdout"] = "0\n"
    with pytest.raises(SystemExit):
        user_cmd.cmd_user(args())
    assert "No account named alice" in capsys.readouterr().err


def test_psql_error_fails(psql, capsys):
    _, out = psql
    out.update(returncode=2, stderr="boom")
    with pytest.raises(SystemExit):
        user_cmd.cmd_user(args())
    assert "boom" in capsys.readouterr().err


def test_short_password_never_reaches_the_database(psql, monkeypatch):
    calls, _ = psql
    monkeypatch.setenv("PYRACMS_NEW_PASSWORD", "short")
    with pytest.raises(SystemExit):
        user_cmd.cmd_user(args())
    assert calls == []


def test_declined_confirmation_changes_nothing(psql, monkeypatch):
    calls, _ = psql
    monkeypatch.setattr("builtins.input", lambda *_: "n")
    user_cmd.cmd_user(args(yes=False))
    assert calls == []
