import json
import sys

import pytest

import build_game as bg


def make_game(tmp_path, engine="pygame"):
    for f in ("main.py", "build.py", "x_logic.py", "x_view.py"):
        (tmp_path / f).write_text("")
    meta = {"name": "x", "engine": engine, "entry": "main.py"}
    (tmp_path / "game.json").write_text(json.dumps(meta))
    return meta


def test_hidden_modules_skip_entry_and_build(tmp_path):
    make_game(tmp_path)
    assert bg.hidden_modules(str(tmp_path)) == ["x_logic", "x_view"]


def test_command_onefile_and_pyglet(tmp_path):
    meta = make_game(tmp_path, "pyglet")
    cmd = bg.build_command(str(tmp_path), meta, platform="linux")
    assert "--onefile" in cmd and "--collect-submodules" in cmd
    assert cmd.count("--hidden-import") == 2
    assert cmd[-1].endswith("main.py")


def test_command_macos_is_onedir(tmp_path):
    meta = make_game(tmp_path)
    cmd = bg.build_command(str(tmp_path), meta, platform="darwin")
    assert "--onedir" in cmd and "--collect-submodules" not in cmd


def test_all_games_lists_dirs_with_game_json(tmp_path):
    (tmp_path / "a").mkdir()
    (tmp_path / "a" / "game.json").write_text("{}")
    (tmp_path / "b").mkdir()
    assert bg.all_games(str(tmp_path)) == ["a"]
    assert "snake" in bg.all_games()


def test_build_runs_subprocess(tmp_path, monkeypatch):
    make_game(tmp_path)
    calls = []
    monkeypatch.setattr(bg.subprocess, "call",
                        lambda cmd: calls.append(cmd) or 0)
    assert bg.build(str(tmp_path)) == 0 and calls[0][0] == sys.executable


def test_main_requires_a_game(monkeypatch):
    with pytest.raises(SystemExit):
        bg.main([])
    calls = []
    monkeypatch.setattr(bg, "build", lambda d, o: calls.append(d) or 0)
    assert bg.main(["snake", "pong"]) == 0 and len(calls) == 2
    assert bg.main(["--all"]) == 0 and len(calls) > 2
