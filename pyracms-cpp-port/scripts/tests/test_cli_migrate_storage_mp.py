from migrate_env import env, run, U  # noqa: F401


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
