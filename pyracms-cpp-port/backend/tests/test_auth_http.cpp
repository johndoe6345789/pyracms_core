#include "http_accounts.h"

using namespace harness;

static Json::Value creds(const Site &s, const std::string &pw) {
    return J({{"username", s.user.name}, {"password", pw},
              {"tenant", s.slug}});
}

TEST(AuthHttp, LoginMeAndValidation) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto ok1 = post("/api/auth/login", creds(s, "password123"));
    ASSERT_EQ(ok1.status, 200);
    auto tok = ok1.json["token"].asString();
    EXPECT_EQ(get("/api/auth/me", tok).status, 200);
    EXPECT_EQ(get("/api/auth/me").status, 401);
    EXPECT_EQ(post("/api/auth/login", creds(s, "wrong-pass")).status, 401);
    EXPECT_EQ(post("/api/auth/login", J({{"username", "x"}})).status, 400);
    auto bad = creds(s, "password123");
    bad["tenant"] = "nope-slug";
    EXPECT_EQ(post("/api/auth/login", bad).status, 404);
    testDb()->execSqlSync("UPDATE users SET banned = true WHERE id = $1",
                          s.user.id);
    EXPECT_EQ(post("/api/auth/login", creds(s, "password123")).status, 403);
    auto reg = J({{"username", "ab"}, {"email", "a@b.c"},
                  {"password", "password123"}});
    EXPECT_EQ(post("/api/auth/register", reg).status, 400);
    reg["username"] = "abc";
    reg["password"] = "short";
    EXPECT_EQ(post("/api/auth/register", reg).status, 400);
    EXPECT_EQ(post("/api/auth/register", J({{"username", "abc"}})).status,
              400);
    auto dup = J({{"username", s.admin.name}, {"email", "d@d.test"},
                  {"password", "password123"}, {"tenant", s.slug}});
    EXPECT_GE(post("/api/auth/register", dup).status, 400);
}

TEST(AuthHttp, ClosedRegistrationRefusesNewSiteMembers) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto reg = [&]() {
        auto n = uniq("cr");
        return post("/api/auth/register",
                    J({{"username", n}, {"email", n + "@h.test"},
                       {"password", "password123"}, {"tenant", s.slug}}));
    };
    auto set = [&](const char *v) {
        return put("/api/settings/registration_open",
                   J({{"tenantId", s.id}, {"value", v}}), s.admin.token);
    };
    EXPECT_EQ(set("false").status, 200);
    EXPECT_EQ(reg().status, 403);
    EXPECT_EQ(set("true").status, 200);
    EXPECT_TRUE(ok(reg()));
}
