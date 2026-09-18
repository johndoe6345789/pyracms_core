import pytest

from hn_api import ApiError, Client


class Seq(list):
    """Answers returned one per call."""


class Scripted(Client):
    """Client whose request() replays canned answers per (method, path)."""

    def __init__(self, answers):
        super().__init__("http://h")
        self.answers, self.log = answers, []

    def request(self, method, path, body=None):
        self.log.append((method, path, body))
        ans = self.answers[(method, path)]
        if isinstance(ans, Seq):
            ans = ans.pop(0)
        if isinstance(ans, Exception):
            raise ans
        return ans


def test_lookup_maps_names_to_ids():
    c = Scripted({("GET", "/api/architectures"): [{"name": "arm", "id": 5}]})
    assert c.lookup("architectures") == {"arm": 5}


def test_file_id_pages_until_found_or_404():
    page1 = [{"uuid": str(i), "id": i} for i in range(200)]
    c = Scripted({("GET", "/api/files?limit=200&offset=0"): page1,
                  ("GET", "/api/files?limit=200&offset=200"):
                  [{"uuid": "z", "id": 999}]})
    assert c.file_id("z") == 999
    c = Scripted({("GET", "/api/files?limit=200&offset=0"): []})
    with pytest.raises(ApiError):
        c.file_id("missing")


def test_get_page_404_is_none_other_errors_raise():
    path = "/api/gamedep/game/a%20b"
    c = Scripted({("GET", path): ApiError(404, "no")})
    assert c.get_page("game", "a b") is None
    c = Scripted({("GET", path): ApiError(500, "bad")})
    with pytest.raises(ApiError):
        c.get_page("game", "a b")
