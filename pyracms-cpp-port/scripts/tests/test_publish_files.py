import urllib.request

import pytest

import publish_files as pf
from fakes import FakeClient
from hn_errors import ApiError

IDS = ("win", "x86_64", {"win": 1}, {"x86_64": 9})


def test_backend_arch_maps_arm64(monkeypatch):
    monkeypatch.delenv("HN_ARM64_ARCH_NAME", raising=False)
    assert pf.backend_arch("arm64") == "arm"
    assert pf.backend_arch("x86_64") == "x86_64"
    monkeypatch.setenv("HN_ARM64_ARCH_NAME", "arm64")
    assert pf.backend_arch("arm64") == "arm64"


def test_resolve_file_searches_files_dir(tmp_path):
    sub = tmp_path / "art" / "win"
    sub.mkdir(parents=True)
    (sub / "g.exe").write_bytes(b"1")
    got = pf.resolve_file({"file": "g.exe"}, str(tmp_path / "art"))
    assert got == str(sub / "g.exe")


def test_resolve_file_downloads_from_url(monkeypatch):
    seen = {}
    monkeypatch.setattr(urllib.request, "urlretrieve",
                        lambda url, dest: seen.update(url=url, dest=dest))
    got = pf.resolve_file({"file": "g.exe", "url": "http://u/g"}, None)
    assert seen["url"] == "http://u/g" and got == seen["dest"]


def test_resolve_file_missing_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        pf.resolve_file({"file": "g.exe"}, str(tmp_path))


def test_attach_binary_posts_ids(tmp_path):
    c = FakeClient()
    pf.attach_binary(c, "game", "g", "1.0", "/p", IDS)
    method, path, body = c.calls[0]
    assert path == "/api/gamedep/game/g/revisions/1.0/binaries"
    assert body == {"osId": 1, "archId": 9, "fileId": 42}


def test_attach_binary_conflict_is_skipped(capsys):
    c = FakeClient()
    path = "/api/gamedep/game/g/revisions/1.0/binaries"
    c.fail[("POST", path)] = ApiError(409, "dup")
    pf.attach_binary(c, "game", "g", "1.0", "/p", IDS)
    assert "already attached" in capsys.readouterr().out
    c.fail[("POST", path)] = ApiError(500, "bad")
    with pytest.raises(ApiError):
        pf.attach_binary(c, "game", "g", "1.0", "/p", IDS)
