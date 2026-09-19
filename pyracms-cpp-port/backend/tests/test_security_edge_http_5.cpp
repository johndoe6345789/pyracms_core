#include "http_accounts.h"

using namespace harness;

namespace {
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
const std::string kPng = std::string("\x89PNG\r\n\x1a\n", 8) + "pixels";
} // namespace

TEST(SecurityHttp, HeadersErrorsAndLimits) {
    REQUIRE_SERVER();
    auto r = get("/api/tenants");
    EXPECT_EQ(r.headers["x-content-type-options"], "nosniff");
    EXPECT_EQ(r.headers["x-frame-options"], "DENY");
    EXPECT_EQ(r.headers["referrer-policy"], "no-referrer");
    EXPECT_EQ(r.headers["cache-control"], "no-store");
    EXPECT_NE(r.headers["content-security-policy"].find("default-src 'none'"),
              std::string::npos);
    auto pre = call(drogon::Options, "/api/articles");
    EXPECT_EQ(pre.status, 204);
    EXPECT_FALSE(pre.headers["access-control-allow-origin"].empty());
    // malformed numbers are a 400 with a fixed message, never a crash/500
    auto bad = get("/api/articles?tenant_id=abc");
    EXPECT_EQ(bad.status, 400);
    EXPECT_EQ(bad.json["error"].asString(), "Invalid request parameter");
    EXPECT_EQ(get("/api/snippets/abc").status, 400);
    EXPECT_EQ(post("/api/auth/login",
                   J({{"username", Json::Value(Json::arrayValue)},
                      {"password", "x"}})).status, 400);
    auto big = post("/api/analytics/track",
                    J({{"path", std::string(2200000, 'x')}, {"tenant_id", 1}}));
    EXPECT_EQ(big.status, 413);
    // hostile search syntax reaches the database only as plain words
    auto s = makeSite();
    for (const char *q : {"a%3A*%7Cb", "!(x", "x%26y'--", "%25", "%3C-%3E"}) {
        EXPECT_EQ(get("/api/search" + tq(s) + "&q=" + q).status, 200) << q;
    }
    EXPECT_EQ(get("/api/search/autocomplete" + tq(s) + "&q=%25_%5C").status,
              200);
    EXPECT_EQ(get("/api/users").status, 401);
    EXPECT_EQ(get("/api/articles" + tq(s) + "&limit=-5&offset=-9").status, 200);
    EXPECT_EQ(get("/api/articles" + tq(s) + "&limit=99999999").status, 200);
}

TEST(SecurityMenus, LinksCannotCarryScriptSchemes) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    ASSERT_TRUE(ok(post("/api/menu-groups",
                        J({{"name", "nav"}, {"tenantId", s.id}}), a)));
    auto items = "/api/menu-groups/" + std::to_string(maxId("menu_groups")) +
                 "/items";
    for (const char *bad : {"javascript:alert(1)", "JaVaScRiPt:x",
                            "data:text/html,x",
                            "//evil.example/x", "/\evil.example", "vbscript:x"})
        EXPECT_EQ(post(items, J({{"name", "n"}, {"url", bad}}), a).status, 400)
            << bad;
    for (const char *good : {"/about", "https://example.com/x", "mailto:a@b.co",
                             "about/us"})
        EXPECT_EQ(post(items, J({{"name", "n"}, {"url", good}}), a).status, 200)
            << good;
    auto id = std::to_string(maxId("menu_items"));
    EXPECT_EQ(put("/api/menus/" + id, J({{"url", "javascript:alert(1)"}}), a)
                  .status, 400);
    EXPECT_EQ(put("/api/menus/" + id, J({{"url", "/ok"}}), a).status, 200);
}
