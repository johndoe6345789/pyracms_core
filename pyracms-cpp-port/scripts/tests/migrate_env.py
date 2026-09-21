import argparse
import hashlib
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from cli_pkg import migrate_cmd, migrate_db  # noqa: E402
from cli_pkg.s3_store import Store  # noqa: E402
import fake_store  # noqa: E402
from fake_db import FakeDb  # noqa: E402

U = "aaaa-1111"


def sha(b):
    return hashlib.sha256(b).hexdigest()


@pytest.fixture
def env(tmp_path, monkeypatch):
    st, srv, url = fake_store.start()
    db = FakeDb({U: [7, sha(b"hello"), 5]})
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
