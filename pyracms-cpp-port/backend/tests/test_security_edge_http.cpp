#include "http_accounts.h"

using namespace harness;

namespace {
std::string tq(const Site &s) { return "?tenant_id=" + std::to_string(s.id); }
const std::string kPng = std::string("\x89PNG\r\n\x1a\n", 8) + "pixels";
} // namespace

TEST(SecurityWebhooks, AdminsOnlyAndNoInternalTargets) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto hook = [&](const std::string &url, const std::string &tok) {
        return post("/api/webhooks",
                    J({{"url", url}, {"events", A({"ping"})},
                       {"tenant_id", s.id}, {"secret", "sh"}}), tok);
    };
    EXPECT_EQ(hook("http://8.8.8.8/h", s.user.token).status, 403);
    EXPECT_EQ(get("/api/webhooks" + tq(s), s.user.token).status, 403);
    unsetenv("PYRACMS_ALLOW_PRIVATE_URLS");
    for (const char *bad :
         {"http://127.0.0.1:3299/x", "http://localhost/x",
          "http://169.254.169.254/latest/meta-data/", "http://10.0.0.5/",
          "http://[::1]/", "file:///etc/passwd", "ftp://8.8.8.8/",
          "http://user:pw@8.8.8.8/"})
        EXPECT_EQ(hook(bad, s.admin.token).status, 400) << bad;
    auto good = hook("http://8.8.8.8/h", s.admin.token);
    EXPECT_EQ(good.status, 201) << good.text;
    setenv("PYRACMS_ALLOW_PRIVATE_URLS", "1", 1);
    auto id = std::to_string(good.json["id"].asInt());
    unsetenv("PYRACMS_ALLOW_PRIVATE_URLS");
    EXPECT_EQ(put("/api/webhooks/" + id, J({{"url", "http://127.0.0.1/"}}),
                  s.admin.token).status, 400);
    setenv("PYRACMS_ALLOW_PRIVATE_URLS", "1", 1);
    // other accounts and other sites cannot touch it
    auto other = makeSite();
    for (const auto &tok : {s.user.token, other.admin.token}) {
        EXPECT_EQ(put("/api/webhooks/" + id, J({{"active", false}}), tok).status,
                  403);
        EXPECT_EQ(del("/api/webhooks/" + id, tok).status, 403);
        EXPECT_EQ(get("/api/webhooks/" + id + "/deliveries", tok).status, 403);
    }
    EXPECT_EQ(get("/api/webhooks/999999/deliveries", s.admin.token).status, 404);
    auto list = get("/api/webhooks" + tq(s), s.admin.token);
    EXPECT_EQ(list.text.find("\"secret\""), std::string::npos);
    // a partial update keeps everything it did not mention
    EXPECT_EQ(put("/api/webhooks/" + id, J({{"active", false}}),
                  s.admin.token).status, 200);
    auto row = testDb()->execSqlSync(
        "SELECT url, active, secret FROM webhooks WHERE id = $1::int", id);
    EXPECT_EQ(row[0]["url"].as<std::string>(), "http://8.8.8.8/h");
    EXPECT_FALSE(row[0]["active"].as<bool>());
    EXPECT_EQ(row[0]["secret"].as<std::string>(), "sh");
    // event names cannot smuggle array syntax into the database
    EXPECT_EQ(hook("http://8.8.8.8/h", s.admin.token).status, 201);
    EXPECT_EQ(post("/api/webhooks",
                   J({{"url", "http://8.8.8.8/h"}, {"tenant_id", s.id},
                      {"events", A({"a\",\"b"})}}), s.admin.token).status, 400);
    EXPECT_EQ(post("/api/webhooks",
                   J({{"url", "http://8.8.8.8/h"}, {"tenant_id", s.id},
                      {"events", "ping"}}), s.admin.token).status, 400);
}

TEST(SecurityFiles, UploadsAreOwnedSanitisedAndServedInertly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug);
    auto up = upload("/api/files", s.user.token, "../../evil.png", kPng);
    ASSERT_EQ(up.status, 200) << up.text;
    EXPECT_EQ(up.json["filename"].asString(), "evil.png");
    auto uuid = up.json["uuid"].asString();
    auto dl = get("/api/files/" + uuid);
    EXPECT_EQ(dl.status, 200);
    EXPECT_NE(dl.headers["content-type"].find("image/png"), std::string::npos);
    EXPECT_NE(dl.headers["content-disposition"].find("attachment"),
              std::string::npos);
    EXPECT_EQ(dl.headers["content-disposition"].find(".."), std::string::npos);
    EXPECT_EQ(dl.headers["x-content-type-options"], "nosniff");
    // owner-only delete; listing is scoped
    EXPECT_EQ(del("/api/files/" + uuid, other.token).status, 403);
    auto mine = get("/api/files", s.user.token);
    auto theirs = get("/api/files", other.token);
    EXPECT_NE(mine.text.find(uuid), std::string::npos);
    EXPECT_EQ(theirs.text.find(uuid), std::string::npos);
    EXPECT_NE(get("/api/files", s.admin.token).text.find(uuid),
              std::string::npos);
    auto foreign = makeSite();
    EXPECT_EQ(get("/api/files", foreign.admin.token).text.find(uuid),
              std::string::npos);
    EXPECT_EQ(del("/api/files/" + uuid, foreign.admin.token).status, 403);
    // traversal and junk ids never reach the filesystem
    for (const char *bad : {"..", "..%2F..%2Fetc%2Fpasswd", "not-a-uuid",
                            "%2e%2e"}) {
        EXPECT_NE(del(std::string("/api/files/") + bad, s.admin.token).status,
                  200) << bad;
        EXPECT_EQ(get(std::string("/api/files/") + bad).status, 404) << bad;
    }
    // active content is refused or neutralised
    EXPECT_EQ(upload("/api/files", s.user.token, "x.gif", "<script>").status,
              415);
    auto svg = upload("/api/files", s.user.token, "v.svg", "<svg onload=x/>");
    ASSERT_EQ(svg.status, 200);
    auto got = get("/api/files/" + svg.json["uuid"].asString());
    EXPECT_NE(got.headers["content-security-policy"].find("sandbox"),
              std::string::npos);
    EXPECT_EQ(del("/api/files/" + uuid, s.admin.token).status, 200);
}

TEST(SecurityAnalytics, ReadsAreForAdminsAndTrackingIsBounded) {
    REQUIRE_SERVER();
    auto s = makeSite();
    for (const char *p : {"page-views", "top-content", "traffic-sources",
                          "search-queries"}) {
        auto url = std::string("/api/analytics/") + p + tq(s);
        EXPECT_EQ(get(url, s.user.token).status, 403) << p;
        EXPECT_EQ(get(url).status, 401) << p;
        EXPECT_EQ(get(url, s.admin.token).status, 200) << p;
    }
    auto other = makeSite();
    EXPECT_EQ(get("/api/analytics/page-views" + tq(s), other.admin.token)
                  .status, 403);
    auto bad = post("/api/analytics/track",
                    J({{"path", "/x"}, {"tenant_id", 999999}}));
    EXPECT_EQ(bad.status, 400);
    EXPECT_EQ(bad.text.find("violates"), std::string::npos);
    EXPECT_EQ(bad.text.find("constraint"), std::string::npos);
    EXPECT_EQ(post("/api/analytics/track",
                   J({{"path", std::string(900, 'p')}, {"tenant_id", s.id}}))
                  .status, 200);
    EXPECT_EQ(post("/api/analytics/track", J({{"path", 5}, {"tenant_id", s.id}}))
                  .status, 400);
}

TEST(SecuritySocial, RepliesStayInTheirThreadAndFollowsStayOnTheirSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto c1 = post("/api/comments/article/1", J({{"body", "one"}}), s.user.token);
    ASSERT_EQ(c1.status, 201);
    auto c2 = post("/api/comments/article/2", J({{"body", "two"}}), s.user.token);
    ASSERT_EQ(c2.status, 201);
    auto reply = [&](const char *thread, int parent) {
        return post(std::string("/api/comments/") + thread,
                    J({{"body", "r"}, {"parentId", parent}}), s.user.token);
    };
    EXPECT_EQ(reply("article/1", c1.json["id"].asInt()).status, 201);
    EXPECT_EQ(reply("article/1", c2.json["id"].asInt()).status, 400);
    EXPECT_EQ(reply("article/1", 999999).status, 400);
    EXPECT_EQ(post("/api/comments/article/1",
                   J({{"body", std::string(10001, 'x')}}), s.user.token).status,
              400);
    EXPECT_EQ(post("/api/comments/article/1", J({{"body", 5}}), s.user.token)
                  .status, 400);
    auto other = makeSite();
    auto path = "/api/users/" + std::to_string(other.user.id) + "/follow";
    EXPECT_EQ(post(path, Json::Value(Json::objectValue), s.user.token).status,
              400);
    auto own = signup(s.slug);
    EXPECT_EQ(post("/api/users/" + std::to_string(own.id) + "/follow",
                   Json::Value(Json::objectValue), s.user.token).status, 200);
    EXPECT_EQ(get("/api/users/" + std::to_string(s.user.id) +
                  "/followers?limit=100000").status, 200);
}

TEST(SecurityTenantsAndSnippets, NamesAndCodeAreBounded) {
    REQUIRE_SERVER();
    auto pa = platformAdmin();
    for (const char *slug : {"Bad Slug", "UPPER", "api", "admin", "-x",
                             "a_b", "x.y"})
        EXPECT_EQ(post("/api/tenants", J({{"slug", slug}, {"displayName", "N"}}),
                       pa.token).status, 400) << slug;
    EXPECT_EQ(post("/api/tenants", J({{"slug", std::string(64, 'a')},
                                       {"displayName", "N"}}), pa.token).status,
              400);
    EXPECT_EQ(post("/api/tenants", J({{"slug", uslug("ok")},
                                       {"displayName", 5}}), pa.token).status,
              400);
    auto s = makeSite();
    auto mk = [&](Json::Value b) {
        b["tenant_id"] = s.id;
        return post("/api/snippets", b, s.user.token).status;
    };
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", "c"}, {"language", "py thon"}})),
              400);
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", "c"}, {"visibility", "world"}})),
              400);
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", std::string(100001, 'c')}})), 400);
    EXPECT_EQ(mk(J({{"title", "t"}, {"code", "print(1)"}})), 201);
}

TEST(SecurityUsers, ProfileUpdatesCannotTouchPrivilegedFields) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto path = "/api/users/" + std::to_string(s.user.id);
    auto r = put(path, J({{"aboutme", "hi"}, {"role", 4}, {"banned", true},
                          {"tenant_id", s.id}, {"password_hash", "x"}}),
                 s.user.token);
    EXPECT_EQ(r.status, 200);
    auto row = testDb()->execSqlSync(
        "SELECT role, banned, tenant_id, password_hash, aboutme FROM users "
        "WHERE id = $1", s.user.id);
    EXPECT_EQ(row[0]["role"].as<int>(), 1);
    EXPECT_FALSE(row[0]["banned"].as<bool>());
    EXPECT_EQ(row[0]["tenant_id"].as<int>(), s.id);
    EXPECT_NE(row[0]["password_hash"].as<std::string>(), "x");
    EXPECT_EQ(row[0]["aboutme"].as<std::string>(), "hi");
    EXPECT_EQ(put(path, J({{"website", "javascript:alert(1)"}}), s.user.token)
                  .status, 400);
    EXPECT_EQ(put(path, J({{"email", "bad\r\nx"}}), s.user.token).status, 400);
    EXPECT_EQ(put(path, J({{"aboutme", Json::Value(Json::arrayValue)}}),
                  s.user.token).status, 400);
    EXPECT_EQ(put(path, J({{"timezone", "../etc"}}), s.user.token).status, 400);
    EXPECT_EQ(put(path, J({{"website", "https://ok.example/p"}}), s.user.token)
                  .status, 200);
}

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
