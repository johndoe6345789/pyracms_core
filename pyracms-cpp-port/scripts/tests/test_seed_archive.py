import os

from seed_archive import attach_source
from test_game_archive import make_game


class Fake:
    def __init__(self, revisions):
        self.revs = revisions
        self.calls = []

    def get_page(self, type_, name):
        return {"revisions": self.revs}

    def ensure_revision(self, type_, name, version, module_type=""):
        self.calls.append(("rev", version, module_type))
        return {"version": version, "published": False}

    def ensure_published(self, type_, name, rev):
        self.calls.append(("publish", rev["version"]))

    def upload_file(self, path):
        self.calls.append(("upload", path.rsplit("-", 1)[-1]))
        return {"uuid": "u1"}

    def request(self, method, path, body=None):
        self.calls.append((method, path, body))


GAME = {"name": "snake", "version": "1.0.0", "moduleType": "python"}


def run(tmp_path, revs):
    c = Fake(revs)
    game_dir = str(tmp_path / "snake")
    if not os.path.isdir(game_dir):
        make_game(tmp_path)
    msg = attach_source(c, GAME, game_dir, str(tmp_path))
    return c, msg


def test_attaches_to_existing_sourceless_revision(tmp_path):
    c, msg = run(tmp_path, [{"version": "1.0.0", "fileId": None}])
    assert ("rev", "1.0.0", "python") in c.calls
    assert ("POST", "/api/gamedep/game/snake/revisions/1.0.0/source",
            {"fileUuid": "u1"}) in c.calls
    assert ("publish", "1.0.0") in c.calls
    assert "attached" in msg and "sha256" in msg


def test_same_sha_is_a_noop(tmp_path):
    _, msg = run(tmp_path, [])
    sha = msg.split("sha256 ")[1].rstrip(")")
    c, msg = run(tmp_path, [{"version": "1.0.0", "fileId": 3,
                             "sha256": sha}])
    assert "up to date" in msg
    assert [x[0] for x in c.calls] == ["publish"]


def test_changed_content_makes_next_revision(tmp_path):
    revs = [{"version": "1.0.0.1", "fileId": 4, "sha256": "old"},
            {"version": "1.0.0", "fileId": 3, "sha256": "older"}]
    c, msg = run(tmp_path, revs)
    assert ("rev", "1.0.0.2", "python") in c.calls
    assert "1.0.0.2 attached" in msg


def test_ignores_other_base_versions(tmp_path):
    c, _ = run(tmp_path, [{"version": "1.0.01", "fileId": 1,
                           "sha256": "x"}])
    assert ("rev", "1.0.0.1", "python") in c.calls or \
        ("rev", "1.0.0", "python") in c.calls
