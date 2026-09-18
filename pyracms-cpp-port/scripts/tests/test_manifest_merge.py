import json
import sys

import pytest

import make_manifest as mm
from test_manifest import binary, game_dir, run


def test_merge_groups_binaries_per_revision(tmp_path):
    d = game_dir(tmp_path)
    paths = []
    for i, (o, a) in enumerate([("win", "x64"), ("lin", "arm64")]):
        out = tmp_path / f"m{i}.json"
        run(["game", "--game-dir", str(d), "--file",
             str(binary(tmp_path)), "--os", o, "--arch", a,
             "--out", str(out)])
        paths.append(str(out))
    cat = tmp_path / "catalog.json"
    assert run(["merge", *paths, "--out", str(cat)]) == 0
    doc = json.loads(cat.read_text())
    game = doc["gamedep"][0]["game"]
    assert len(game["revisions"]) == 1
    assert len(game["revisions"][0]["binaries"]) == 2


def test_merge_launcher_entry(tmp_path):
    f = binary(tmp_path)
    out = tmp_path / "l.json"
    run(["launcher", "--version", "1", "--file", str(f), "--os", "lin",
         "--arch", "x64", "--out", str(out)])
    cat = tmp_path / "c.json"
    run(["merge", str(out), "--out", str(cat)])
    assert "launcher" in json.loads(cat.read_text())["gamedep"][0]


def test_module_runs_as_script(monkeypatch):
    monkeypatch.setattr(sys, "argv", ["make_manifest.py", "--help"])
    with pytest.raises(SystemExit):
        mm.main()
