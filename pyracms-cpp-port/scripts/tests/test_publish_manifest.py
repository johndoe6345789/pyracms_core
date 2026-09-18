import json

import hn_env
import publish_manifest as pm
from fakes import FakeClient
from hn_errors import ApiError


def write_manifest(tmp_path, name="a", kind="game"):
    m = {"kind": kind, "name": name, "version": "1", "os": "lin",
         "arch": "x86_64", "sha256": "0" * 64, "size": 1,
         "dependencies": [{"name": "d"}]}
    p = tmp_path / f"{name}.manifest.json"
    p.write_text(json.dumps(m))
    return str(tmp_path / "*.manifest.json")


def test_no_manifests(tmp_path, capsys):
    assert pm.main([str(tmp_path / "none*.json")]) == 0
    assert "nothing to publish" in capsys.readouterr().out


def test_dry_run_lists_without_api(tmp_path, capsys, monkeypatch):
    monkeypatch.setattr(hn_env, "env_client", lambda: 1 / 0)
    assert pm.main([write_manifest(tmp_path), "--dry-run"]) == 0
    assert "[dry-run] game a 1 lin/x86_64" in capsys.readouterr().out


def test_skip_launcher_filters(tmp_path):
    write_manifest(tmp_path, "l", "launcher")
    pattern = write_manifest(tmp_path, "g")
    assert len(pm.load_manifests([pattern])) == 2
    assert len(pm.load_manifests([pattern], skip_launcher=True)) == 1


def test_unconfigured_env_exits_cleanly(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(hn_env, "env_client", lambda: None)
    assert pm.main([write_manifest(tmp_path)]) == 0
    assert "skipping" in capsys.readouterr().out


def test_login_failure_returns_1(tmp_path, monkeypatch):
    def boom():
        raise ApiError(401, "no")
    monkeypatch.setattr(hn_env, "env_client", boom)
    assert pm.main([write_manifest(tmp_path)]) == 1


def test_publishes_every_manifest(tmp_path, monkeypatch, capsys):
    published = []
    monkeypatch.setattr(hn_env, "env_client", lambda: FakeClient())
    monkeypatch.setattr(pm, "publish_one",
                        lambda c, m, d, o, a: published.append(m["name"]))
    write_manifest(tmp_path, "b")
    assert pm.main([write_manifest(tmp_path, "a")]) == 0
    assert published == ["a", "b"]
    assert "Published 2" in capsys.readouterr().out
