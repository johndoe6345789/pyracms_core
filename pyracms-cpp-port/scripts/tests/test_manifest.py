import json
import sys

import pytest

import make_manifest as mm
from manifest_util import norm_arch, norm_os, sha256_of


def game_dir(tmp_path, deps=None):
    d = tmp_path / "snake"
    d.mkdir()
    meta = {"name": "snake", "displayName": "Snake", "version": "1.0.0",
            "moduleType": "python", "engine": "pygame", "tags": ["a"],
            "entry": "main.py", "pipRequirements": ["pygame==2.6.1"],
            "dependencies": deps or []}
    (d / "game.json").write_text(json.dumps(meta))
    return d


def binary(tmp_path, data=b"abc"):
    f = tmp_path / "snake.exe"
    f.write_bytes(data)
    return f


def run(argv):
    return mm.main(argv)


def test_normalisers():
    assert norm_os("Windows") == "win" and norm_os("darwin") == "mac"
    assert norm_arch("AMD64") == "x86_64" and norm_arch("aarch64") == "arm64"
    with pytest.raises(KeyError):
        norm_os("beos")


def test_sha256_of(tmp_path):
    assert sha256_of(str(binary(tmp_path))).startswith("ba7816bf")


def test_game_manifest_written(tmp_path, capsys):
    d, f = game_dir(tmp_path), binary(tmp_path)
    out = tmp_path / "m.json"
    rc = run(["game", "--game-dir", str(d), "--file", str(f), "--os",
              "windows", "--arch", "x64", "--url", "http://u", "--version",
              "2.0.0", "--out", str(out)])
    m = json.loads(out.read_text())
    assert rc == 0 and str(out) in capsys.readouterr().out
    assert m["os"] == "win" and m["arch"] == "x86_64"
    assert m["version"] == "2.0.0" and m["size"] == 3 and m["url"] == "http://u"
    assert m["pipRequirements"] == ["pygame==2.6.1"]


def test_dependency_file_hashed(tmp_path):
    dep = {"name": "lib", "version": "1", "file": "lib.whl"}
    d = game_dir(tmp_path, [dep, {"name": "nofile", "version": "1"}])
    (d / "lib.whl").write_bytes(b"zz")
    out = tmp_path / "m.json"
    run(["game", "--game-dir", str(d), "--file", str(binary(tmp_path)),
         "--os", "lin", "--arch", "arm64", "--out", str(out)])
    deps = json.loads(out.read_text())["dependencies"]
    assert deps[0]["size"] == 2 and "sha256" in deps[0]
    assert "sha256" not in deps[1]


def test_launcher_manifest_default_output_name(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    f = binary(tmp_path)
    run(["launcher", "--version", "0.1.0", "--file", str(f), "--os",
         "mac", "--arch", "arm64"])
    m = json.loads((tmp_path / "snake.exe.manifest.json").read_text())
    assert m["kind"] == "launcher" and m["name"] == "hypernucleus"
    assert m["moduleType"] == "native" and m["tags"] == ["launcher"]
