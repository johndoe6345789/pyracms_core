import pytest

from hn_api import ApiError
from test_hn_api import Scripted, Seq


def test_ensure_page_creates_when_missing():
    get = ("GET", "/api/gamedep/game/g")
    c = Scripted({get: Seq([ApiError(404, ""), {"name": "g"}]),
                  ("POST", "/api/gamedep/game"): {}})
    assert c.ensure_page("game", "g", "G", "d") == {"name": "g"}
    assert c.log[1][2]["displayName"] == "G"


def test_ensure_page_reuses_existing():
    c = Scripted({("GET", "/api/gamedep/game/g"): {"name": "g"}})
    c.ensure_page("game", "g", "G", "d")
    assert len(c.log) == 1


def test_ensure_revision_existing_and_created():
    get = ("GET", "/api/gamedep/game/g")
    rev = {"version": "1.0.0", "id": 3}
    c = Scripted({get: {"revisions": [rev]}})
    assert c.ensure_revision("game", "g", "1.0.0") == rev
    c = Scripted({get: Seq([{"revisions": []}, {"revisions": [rev]}]),
                  ("POST", "/api/gamedep/game/g/revisions"): {}})
    assert c.ensure_revision("game", "g", "1.0.0", "python") == rev


def test_ensure_revision_missing_after_create_raises():
    get = ("GET", "/api/gamedep/game/g")
    c = Scripted({get: {"revisions": []},
                  ("POST", "/api/gamedep/game/g/revisions"): {}})
    with pytest.raises(ApiError):
        c.ensure_revision("game", "g", "9")


def test_ensure_published_only_when_needed():
    c = Scripted({("POST", "/api/gamedep/game/g/revisions/1.0/publish"): {}})
    c.ensure_published("game", "g", {"version": "1.0", "published": True})
    assert c.log == []
    c.ensure_published("game", "g", {"version": "1.0"})
    assert len(c.log) == 1
