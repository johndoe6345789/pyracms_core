import api_calls
import api_paths
import api_routes
import check_api_contract as cac

HDR = """
#define GD "/api/gamedep/{type}"
ADD_METHOD_TO(A::list, "/api/things", drogon::Get);
ADD_METHOD_TO(A::one, "/api/things/{id}",
              drogon::Put, PYR_JWT);
ADD_METHOD_TO(A::tags, GD "/tags", drogon::Post);
ADD_METHOD_VIA_REGEX(A::c, "/api/c/([a-z]+)/([0-9]+)", drogon::Get);
WS_PATH_ADD("/api/ws/x");
"""


def routes(tmp_path):
    (tmp_path / "A.h").write_text(HDR)
    return api_routes.load(tmp_path)


def test_routes_resolve_defines_regex_and_ws(tmp_path):
    got = {(v, p) for v, p, _ in routes(tmp_path)}
    assert ("POST", "/api/gamedep/{type}/tags") in got
    assert ("GET", "/api/c/([a-z]+)/([0-9]+)") in got
    assert ("GET", "/api/ws/x") in got


def test_match_verb_path_and_holes(tmp_path):
    r = routes(tmp_path)
    assert api_paths.match("GET", "/api/things", r)
    assert not api_paths.match("POST", "/api/things", r)
    assert api_paths.match("PUT", "/api/things/{}", r)
    assert not api_paths.match("GET", "/api/gamedep/game/item/{}", r)
    assert api_paths.match("GET", "/api/c/{}/{}", r)


def test_normalise_strips_query_and_holes():
    n = api_paths.normalise
    assert n("/api/a/${id}?x=${y}") == "/api/a/{}"
    assert n("${API_URL}/api/a/{q(n)}") == "/api/a/{}"
    assert n("/api/articles${q}") == "/api/articles"


def write(tmp_path, rel, text):
    f = tmp_path / rel
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(text)


def test_collect_finds_js_py_cpp_calls(tmp_path):
    write(tmp_path, "frontend/src/a.ts",
          "api.post(\n  `/api/things/${id}/x`, {})\n")
    write(tmp_path, "frontend/src/__tests__/a.ts", "get('/api/skip')")
    write(tmp_path, "scripts/s.py", 'c.request("PUT", f"/api/t/{a}")\n')
    write(tmp_path, "client/src/c.cpp",
          'm_nam->get(createRequest("/api/files/" + uuid));\n')
    got = {(v, p) for v, p, _ in api_calls.collect(tmp_path)}
    assert got == {("POST", "/api/things/{}/x"), ("PUT", "/api/t/{}"),
                   ("GET", "/api/files/{}")}


def test_collect_resolves_base_const_and_rtk(tmp_path):
    write(tmp_path, "frontend/src/h.ts",
          "const b = `/api/a/${n}`\napi.put(`${b}/tags`, {})\n")
    write(tmp_path, "frontend/src/store/endpoints/e.ts",
          "query: () => '/users'\n")
    got = {p for _, p, _ in api_calls.collect(tmp_path)}
    assert "/api/a/{}/tags" in got and "/users" in got


def test_check_reports_unmatched(tmp_path):
    bad = cac.check(routes(tmp_path), [("GET", "/api/nope", "f:1"),
                                       ("GET", "/api/things", "f:2")])
    assert bad == [("GET", "/api/nope", "f:1")]

def test_real_repo_has_no_unmatched_calls(capsys):
    assert cac.main([]) == 0
    assert "0 unmatched" in capsys.readouterr().out
