import argparse
import hashlib
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from cli_pkg import migrate_cmd, migrate_db  # noqa: E402
from cli_pkg.s3_store import Store  # noqa: E402
import fake_store  # noqa: E402

U = "aaaa-1111"


def sha(b):
    return hashlib.sha256(b).hexdigest()


@pytest.fixture
def env(tmp_path, monkeypatch):
    st, srv, url = fake_store.start()
    db = fake_store.FakeDb({U: [7, sha(b"hello"), 5]})
    monkeypatch.setattr(migrate_db, "psql", db)
    (tmp_path / "thumbnails").mkdir()
    (tmp_path / U).write_bytes(b"hello")
    (tmp_path / "thumbnails" / U).write_bytes(b"th")
    yield st, db, tmp_path, Store(url, "b", "a", "s")
    srv.shutdown()


def run(env, **kw):
    st, db, tmp, store = env
    a = dict(dry_run=False, delete_local=False, uploads_dir=str(tmp))
    with pytest.raises(SystemExit) as e:
        migrate_cmd.cmd_migrate_storage(
            argparse.Namespace(**{**a, **kw}), store)
        raise SystemExit(0)
    return e.value.code


def test_dry_run_changes_nothing(env):
    assert run(env, dry_run=True) == 0
    assert env[0].log == [] and env[1].storage == {}


def test_success_flips_row_and_uploads_thumb(env):
    assert run(env) == 0
    st, db, tmp, _ = env
    assert st.objects == {f"tenant-7-{U}": b"hello",
                          f"tenant-7-thumb-{U}": b"th"}
    assert db.storage == {U: "s3"} and (tmp / U).exists()


def test_idempotent_rerun(env):
    run(env)
    n = len(env[0].log)
    assert run(env) == 0 and len(env[0].log) == n


def test_mismatch_not_migrated(env):
    (env[2] / U).write_bytes(b"HELLO")
    assert run(env) == 1
    assert env[1].storage == {} and env[0].objects == {}


def test_size_only_check_when_sha_empty(env):
    env[1].rows[U][1] = ""
    assert run(env) == 0
    env[1].rows[U][2] = 9
    env[1].storage.clear()
    assert run(env) == 1


def test_missing_local_file(env, capsys):
    (env[2] / U).unlink()
    assert run(env) == 1
    assert "missing" in capsys.readouterr().err
    assert env[1].storage == {}


def test_delete_local_after_verify(env):
    assert run(env, delete_local=True) == 0
    assert not (env[2] / U).exists()
    assert not (env[2] / "thumbnails" / U).exists()


def test_delete_local_kept_on_bad_readback(env):
    env[0].objects.clear()
    orig = env[3].digest
    env[3].digest = lambda k: ("x", 0)
    assert run(env, delete_local=True) == 1
    env[3].digest = orig
    assert (env[2] / U).exists() and env[1].storage == {}


def test_multipart_path(env):
    env[3].multipart_above, env[3].part = 2, 2
    assert run(env) == 0
    assert env[0].objects[f"tenant-7-{U}"] == b"hello"
    assert ("POST", f"tenant-7-{U}", "uploads") in env[0].log


def test_multipart_aborts_on_failure(env):
    env[3].multipart_above, env[3].part = 2, 2
    env[0].fail_part = True
    assert run(env) == 1
    assert ("DELETE", f"tenant-7-{U}", "uploadId=U1") in env[0].log
    assert env[1].storage == {}
