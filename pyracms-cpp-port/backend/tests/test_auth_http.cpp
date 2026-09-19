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

TEST(AuthHttp, PasswordResetAndEmailVerification) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto email = s.user.name + "@h.test";
    EXPECT_EQ(post("/api/auth/forgot-password", J({{"x", 1}})).status, 400);
    EXPECT_EQ(post("/api/auth/forgot-password",
                   J({{"email", "nobody@h.test"}, {"tenant", s.slug}}))
                  .status, 200);
    EXPECT_EQ(post("/api/auth/forgot-password",
                   J({{"email", email}, {"tenant", s.slug}})).status, 200);
    auto tok = uniq("rst");
    testDb()->execSqlSync("INSERT INTO password_reset_tokens (user_id, "
                          "token, expires_at) VALUES ($1, $2, NOW() + "
                          "INTERVAL '1 hour')", s.user.id, tok);
    EXPECT_EQ(post("/api/auth/reset-password", J({{"token", tok}})).status,
              400);
    EXPECT_EQ(post("/api/auth/reset-password",
                   J({{"token", tok}, {"password", "short"}})).status, 400);
    EXPECT_EQ(post("/api/auth/reset-password",
                   J({{"token", "bad"}, {"password", "newpassword1"}}))
                  .status, 400);
    EXPECT_EQ(post("/api/auth/reset-password",
                   J({{"token", tok}, {"password", "newpassword1"}})).status,
              200);
    EXPECT_EQ(post("/api/auth/login", creds(s, "newpassword1")).status, 200);
    auto vt = uniq("vfy");
    testDb()->execSqlSync("INSERT INTO email_verification_tokens (user_id, "
                          "token, expires_at) VALUES ($1, $2, NOW() + "
                          "INTERVAL '1 hour')", s.user.id, vt);
    EXPECT_EQ(post("/api/auth/verify-email", J({{"x", 1}})).status, 400);
    EXPECT_EQ(post("/api/auth/verify-email", J({{"token", "bad"}})).status,
              400);
    EXPECT_EQ(post("/api/auth/verify-email", J({{"token", vt}})).status, 200);
}

TEST(AuthHttp, OauthEndpointsWithoutProviders) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto t = s.user.token;
    EXPECT_EQ(get("/api/auth/oauth/providers", t).status, 200);
    EXPECT_GE(get("/api/auth/oauth/github/url?state=x").status, 400);
    EXPECT_EQ(post("/api/auth/oauth/github/callback", J({{"x", 1}})).status,
              400);
    EXPECT_GE(post("/api/auth/oauth/github/callback", J({{"code", "c"}}))
                  .status, 400);
    EXPECT_NE(del("/api/auth/oauth/github", t).status, 500);
}
