import pytest

from fakes import FakeClient
from hn_deps import ensure_dep, link_dep
from hn_errors import ApiError
from publish_one import publish_dep, publish_one

OS_IDS = {"lin": 2, "pi": 4}
ARCH_IDS = {"x86_64": 1, "arm": 2, "pi": 3}


def manifest(tmp_path, **extra):
    (tmp_path / "g.bin").write_bytes(b"x")
    m = {"kind": "game", "name": "g", "displayName": "G",
         "description": "d", "version": "1.0", "moduleType": "python",
         "tags": ["t"], "os": "lin", "arch": "x86_64", "file": "g.bin",
         "dependencies": []}
    m.update(extra)
    return m


def test_publish_game_full_flow(tmp_path):
    c = FakeClient()
    publish_one(c, manifest(tmp_path), str(tmp_path), OS_IDS, ARCH_IDS)
    kinds = [call[0] for call in c.calls]
    assert kinds[:2] == ["page", "rev"] and kinds[-1] == "publish"
    assert ("PUT", "/api/gamedep/game/g/tags", {"tags": ["t"]}) in c.calls
    assert c.uploads == [str(tmp_path / "g.bin")]


def test_launcher_is_published_as_dep(tmp_path):
    c = FakeClient()
    m = manifest(tmp_path, kind="launcher", tags=[], arch="arm64")
    publish_one(c, m, str(tmp_path), OS_IDS, ARCH_IDS)
    assert c.calls[0] == ("page", "dep", "g")
    assert not any(call[0] == "PUT" for call in c.calls)


def test_dependencies_are_ensured_attached_and_linked(tmp_path):
    (tmp_path / "lib.whl").write_bytes(b"w")
    dep = {"name": "lib", "version": "2", "file": "lib.whl"}
    c = FakeClient()
    publish_one(c, manifest(tmp_path, dependencies=[dep]), str(tmp_path),
                OS_IDS, ARCH_IDS)
    assert ("page", "dep", "lib") in c.calls
    assert str(tmp_path / "lib.whl") in c.uploads
    assert any(call[1:] == ("/api/gamedep/game/g/dependencies",
                            {"depRevisionId": 7})
               for call in c.calls if call[0] == "POST")


def test_dep_without_file_skips_upload():
    c = FakeClient()
    publish_dep(c, "game", "g", {"name": "l", "version": "1"}, None,
                OS_IDS, ARCH_IDS)
    assert c.uploads == []


def test_link_dep_tolerates_conflict_only():
    c = FakeClient()
    path = "/api/gamedep/game/g/dependencies"
    c.fail[("POST", path)] = ApiError(409, "")
    link_dep(c, "game", "g", {"id": 1})
    c.fail[("POST", path)] = ApiError(500, "")
    with pytest.raises(ApiError):
        link_dep(c, "game", "g", {"id": 1})


def test_ensure_dep_defaults_module_type():
    c = FakeClient()
    assert ensure_dep(c, {"name": "l", "version": "3"})["version"] == "3"
