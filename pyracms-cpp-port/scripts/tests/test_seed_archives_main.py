import json

import hn_env
import seed_games
from fakes import FakeClient
from seed_register import register_game


def test_main_archives_only_skips_registration(tmp_path, monkeypatch,
                                               capsys):
    fake = FakeClient()
    fake.get_page = lambda t, n: {"revisions": []}
    monkeypatch.setattr(hn_env, "env_client", lambda env: fake)
    g = tmp_path / "snake"
    (g / "tests").mkdir(parents=True)
    (g / "main.py").write_text("print(1)")
    (g / "game.json").write_text(json.dumps(
        {"name": "snake", "version": "1.0.0", "moduleType": "python"}))
    assert seed_games.main(str(tmp_path), archives_only=True) == 0
    out = capsys.readouterr().out
    assert "registered" not in out and "source snake 1.0.0 attached" in out
    assert not [x for x in fake.calls if x[0] == "page"]


def test_register_puts_pip_requirements():
    c = FakeClient()
    register_game(c, {"name": "g", "displayName": "G", "description": "d",
                      "version": "1", "pipRequirements": ["pygame==2"]})
    assert ("PUT", "/api/gamedep/game/g/pip",
            {"pipRequirements": ["pygame==2"]}) in c.calls
