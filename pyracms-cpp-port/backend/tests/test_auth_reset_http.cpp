#include "http_accounts.h"
#include "security/Hash.h"

using namespace harness;

static Json::Value creds(const Site &s, const std::string &pw) {
    return J({{"username", s.user.name}, {"password", pw},
              {"tenant", s.slug}});
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
                          "INTERVAL '1 hour')", s.user.id,
                          pyracms::sha256Hex(tok));
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
