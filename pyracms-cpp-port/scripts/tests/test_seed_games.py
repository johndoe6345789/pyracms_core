import json

import hn_env
import seed_games
from fakes import FakeClient
from hn_errors import ApiError
from seed_register import register_game


def make_games(tmp_path):
    g = tmp_path / "snake"
    g.mkdir()
    (g / "game.json").write_text(json.dumps({
        "name": "snake", "displayName": "Snake", "description": "d",
        "version": "1.0.0", "tags": ["a"],
        "pipRequirements": ["pygame==2.6.1"],
        "dependencies": [{"name": "lib", "version": "1"}]}))
    return str(tmp_path)


def test_seed_env_defaults_and_token():
    env = seed_games.seed_env({})
    assert env["HN_API_URL"] == "http://localhost:8080"
    assert env["HN_API_USERNAME"] == "admin"
    tok = seed_games.seed_env({"HN_API_TOKEN": "t"})
    assert "HN_API_USERNAME" not in tok


def test_register_game_flow_and_summary():
    c = FakeClient()
    game = {"name": "g", "displayName": "G", "description": "d",
            "version": "1", "dependencies": [{"name": "l", "version": "2"}]}
    line = register_game(c, game)
    assert line == "registered g 1 (pip: -)"
    assert ("page", "dep", "l") in c.calls and ("publish", "game", "g") \
        in c.calls
    assert ("PUT", "/api/gamedep/game/g/tags", {"tags": []}) in c.calls


def test_main_registers_all_games(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(hn_env, "env_client", lambda env: FakeClient())
    assert seed_games.main(make_games(tmp_path)) == 0
    assert "registered snake 1.0.0 (pip: pygame==2.6.1)" in \
        capsys.readouterr().out


def test_main_reports_login_failure(monkeypatch, capsys):
    def boom(env):
        raise ApiError(401, "no")
    monkeypatch.setattr(hn_env, "env_client", boom)
    assert seed_games.main() == 1
    assert "cannot reach" in capsys.readouterr().err


def test_main_without_credentials(monkeypatch, capsys):
    monkeypatch.setattr(hn_env, "env_client", lambda env: None)
    assert seed_games.main() == 1
    assert "no credentials" in capsys.readouterr().err
