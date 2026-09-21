import pytest  # noqa: F401
from migrate_env import env, run, sha, U  # noqa: F401


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
