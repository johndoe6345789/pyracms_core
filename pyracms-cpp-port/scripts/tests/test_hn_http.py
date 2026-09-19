import json
import urllib.request

import pytest

from fakes import FakeUrlopen, http_error
from hn_errors import ApiError
from hn_http import HttpClient
from hn_multipart import encode_file


def client(monkeypatch, script, token=None):
    fake = FakeUrlopen(script)
    monkeypatch.setattr(urllib.request, "urlopen", fake)
    return HttpClient("http://host/", token), fake


def test_get_sends_auth_header_and_parses_json(monkeypatch):
    c, fake = client(monkeypatch, [{"a": 1}], token="tok")
    assert c.request("GET", "/api/x") == {"a": 1}
    req = fake.requests[0]
    assert req.full_url == "http://host/api/x"
    assert req.get_header("Authorization") == "Bearer tok"


def test_post_body_is_json(monkeypatch):
    c, fake = client(monkeypatch, [None])
    assert c.request("POST", "/p", {"k": "v"}) == {}
    req = fake.requests[0]
    assert json.loads(req.data) == {"k": "v"}
    assert req.get_header("Content-type") == "application/json"


def test_http_error_becomes_api_error(monkeypatch):
    c, _ = client(monkeypatch, [http_error(409, "dup")])
    with pytest.raises(ApiError) as e:
        c.request("GET", "/x")
    assert e.value.status == 409 and "dup" in str(e.value)


def test_login_stores_token_with_tenant(monkeypatch):
    c, fake = client(monkeypatch, [{"token": "T"}])
    assert c.login("u", "p", "acme") == "T" and c.token == "T"
    assert json.loads(fake.requests[0].data)["tenant"] == "acme"


def test_upload_file_multipart(monkeypatch, tmp_path):
    f = tmp_path / "game.bin"
    f.write_bytes(b"DATA")
    c, fake = client(monkeypatch, [{"uuid": "u"}])
    assert c.upload_file(str(f)) == {"uuid": "u"}
    req = fake.requests[0]
    assert b"DATA" in req.data and b'filename="game.bin"' in req.data
    assert req.get_header("Content-type").startswith("multipart/form-data")


def test_encode_file_guesses_type(tmp_path):
    f = tmp_path / "a.json"
    f.write_text("{}")
    body, ctype = encode_file(str(f))
    assert b"application/json" in body and "boundary=" in ctype


def test_gamedep_calls_are_scoped_to_the_tenant_id(monkeypatch):
    c, fake = client(monkeypatch, [{}, {}, {}])
    c.tenant_id = "1"
    c.request("GET", "/api/gamedep/game/x")
    c.request("GET", "/api/gamedep/catalog?limit=5")
    c.request("GET", "/api/files")
    urls = [r.full_url for r in fake.requests]
    assert urls == ["http://host/api/gamedep/game/x?tenant_id=1",
                    "http://host/api/gamedep/catalog?limit=5&tenant_id=1",
                    "http://host/api/files"]
