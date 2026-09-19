#include "http_accounts.h"
#include "security/Hash.h"
#include "services/EmailService.h"

using namespace harness;
using pyracms::EmailService;

static std::string mint(int userId) {
    auto tok = uniq("rst");
    testDb()->execSqlSync("INSERT INTO password_reset_tokens (user_id, "
                          "token, expires_at) VALUES ($1, $2, NOW() + "
                          "INTERVAL '1 hour')", userId,
                          pyracms::sha256Hex(tok));
    return tok;
}

TEST(ResetLink, CarriesTheSiteSlug) {
    EXPECT_EQ(EmailService::resetLink("abc", "demo"),
              "{{BASE_URL}}/reset-password?token=abc&tenant=demo");
    EXPECT_EQ(EmailService::resetLink("abc", ""),
              "{{BASE_URL}}/reset-password?token=abc");
    EXPECT_EQ(EmailService::resetLink("a b", "x&y"),
              "{{BASE_URL}}/reset-password?token=a%20b&tenant=x%26y");
}

TEST(ResetTenant, TokenOnlyResetsItsOwnSitesAccount) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto tok = mint(s.user.id);
    auto body = [&](const std::string &slug) {
        return J({{"token", tok}, {"password", "newpassword1"},
                  {"tenant", slug}});
    };
    // The link names a different site: refused, token stays usable.
    EXPECT_EQ(post("/api/auth/reset-password", body(other.slug)).status, 400);
    EXPECT_EQ(post("/api/auth/reset-password", body("no-such-site")).status,
              404);
    EXPECT_EQ(post("/api/auth/reset-password", body("")).status, 200);
    auto login = post("/api/auth/login",
                      J({{"username", s.user.name},
                         {"password", "newpassword1"}, {"tenant", s.slug}}));
    EXPECT_EQ(login.status, 200);
    // The other site's same-named lookups are unaffected.
    EXPECT_EQ(post("/api/auth/login",
                   J({{"username", s.user.name},
                      {"password", "newpassword1"},
                      {"tenant", other.slug}})).status, 401);
}

TEST(ResetTenant, MatchingSiteIsAccepted) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto tok = mint(s.user.id);
    EXPECT_EQ(post("/api/auth/reset-password",
                   J({{"token", tok}, {"password", "newpassword1"},
                      {"tenant", s.slug}})).status, 200);
    EXPECT_EQ(post("/api/auth/reset-password",
                   J({{"token", tok}, {"password", "newpassword2"},
                      {"tenant", s.slug}})).status, 400);
}
