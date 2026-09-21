import json
import urllib.request

import pytest

import hn_chunked
from fakes import FakeUrlopen, http_error
from hn_errors import ApiError
from hn_http import HttpClient


def client(monkeypatch, script):
    fake = FakeUrlopen(script)
    monkeypatch.setattr(urllib.request, "urlopen", fake)
    return HttpClient("http://host/"), fake


def big(monkeypatch, tmp_path, script, size=10, part=4):
    f = tmp_path / "big.bin"
    f.write_bytes(b"0123456789"[:size])
    monkeypatch.setattr(hn_chunked, "BIG_FILE", 5)
    monkeypatch.setattr(hn_chunked, "BACKOFF", 0)
    init = {"uploadId": "U", "partSize": part, "maxParts": 9}
    c, fake = client(monkeypatch, [init] + script)
    return c, fake, str(f)


def test_big_file_uses_chunked_api(monkeypatch, tmp_path):
    c, fake, f = big(monkeypatch, tmp_path, [{}, {}, {}, {"uuid": "u"}])
    assert c.upload_file(f) == {"uuid": "u"}
    r = fake.requests
    assert [(x.method, x.selector) for x in r] == [
        ("POST", "/api/files/uploads")] + [
        ("PUT", f"/api/files/uploads/U/parts/{n}") for n in (1, 2, 3)] + [
        ("POST", "/api/files/uploads/U/complete")]
    assert [x.data for x in r[1:4]] == [b"0123", b"4567", b"89"]
    assert r[1].get_header("Content-type") == "application/octet-stream"
    init = json.loads(r[0].data)
    assert init["size"] == 10 and init["filename"] == "big.bin"
    assert len(init["sha256"]) == 64


def test_part_retries_on_5xx(monkeypatch, tmp_path):
    s = [http_error(503), {}, {}, {"uuid": "u"}]
    c, fake, f = big(monkeypatch, tmp_path, s, size=6)
    assert c.upload_file(f) == {"uuid": "u"}
    assert len(fake.requests) == 5  # init, 503, 2 parts, done


def test_failure_aborts_upload(monkeypatch, tmp_path):
    s = [http_error(500)] * 3 + [{}]
    c, fake, f = big(monkeypatch, tmp_path, s)
    with pytest.raises(ApiError):
        c.upload_file(f)
    assert fake.requests[-1].method == "DELETE"
    assert fake.requests[-1].selector == "/api/files/uploads/U"


def test_4xx_part_not_retried(monkeypatch, tmp_path):
    c, fake, f = big(monkeypatch, tmp_path, [http_error(400), {}])
    with pytest.raises(ApiError):
        c.upload_file(f)
    assert len(fake.requests) == 3
