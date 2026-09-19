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
        EXPECT_EQ(put("/api/webhooks/" + id, J({{"active", false}}),
                      tok).status, 403);
        EXPECT_EQ(del("/api/webhooks/" + id, tok).status, 403);
        EXPECT_EQ(get("/api/webhooks/" + id + "/deliveries", tok).status, 403);
    }
    EXPECT_EQ(get("/api/webhooks/999999/deliveries", s.admin.token).status,
              404);
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
