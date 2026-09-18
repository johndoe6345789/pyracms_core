import hn_env
from hn_api import Client


def test_none_without_url():
    assert hn_env.env_client({}) is None


def test_token_used_directly():
    c = hn_env.env_client({"HN_API_URL": "http://h", "HN_API_TOKEN": "t"})
    assert isinstance(c, Client) and c.token == "t"


def test_missing_credentials_returns_none():
    assert hn_env.env_client({"HN_API_URL": "http://h"}) is None


def test_login_with_username_password(monkeypatch):
    seen = {}
    monkeypatch.setattr(Client, "login",
                        lambda self, *a: seen.setdefault("args", a))
    env = {"HN_API_URL": "http://h", "HN_API_USERNAME": "u",
           "HN_API_PASSWORD": "p", "HN_API_TENANT": "t"}
    assert hn_env.env_client(env) is not None
    assert seen["args"] == ("u", "p", "t")
