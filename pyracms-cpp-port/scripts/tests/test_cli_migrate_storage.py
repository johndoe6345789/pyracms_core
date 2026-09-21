import pytest  # noqa: F401
from migrate_env import env, run, sha, U  # noqa: F401


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
