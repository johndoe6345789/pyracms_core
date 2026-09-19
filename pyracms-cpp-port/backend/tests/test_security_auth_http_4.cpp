#include "http_accounts.h"
#include "security/Hash.h"
#include "security/RateLimiter.h"
#include "services/UserService.h"

#include <future>
#include <thread>

using namespace harness;
using pyracms::RateLimiter;

namespace {
Json::Value creds(const std::string &user, const std::string &pw,
                  const std::string &slug = "") {
    Json::Value b = J({{"username", user}, {"password", pw}});
    if (!slug.empty())
        b["tenant"] = slug;
    return b;
}

// Base64url without padding (to build tokens by hand).
std::string b64url(const std::string &in) {
    static const char *t =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    std::string out;
    for (size_t i = 0; i < in.size(); i += 3) {
        unsigned v = static_cast<unsigned char>(in[i]) << 16;
        if (i + 1 < in.size())
            v |= static_cast<unsigned char>(in[i + 1]) << 8;
        if (i + 2 < in.size())
            v |= static_cast<unsigned char>(in[i + 2]);
        out += t[(v >> 18) & 63];
        out += t[(v >> 12) & 63];
        if (i + 1 < in.size())
            out += t[(v >> 6) & 63];
        if (i + 2 < in.size())
            out += t[v & 63];
    }
    return out;
}
} // namespace

TEST(SecurityAuth, ResetTokensAreHashedSingleUseAndEndSessions) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto email = s.user.name + "@h.test";
    post("/api/auth/forgot-password",
         J({{"email", email}, {"tenant", s.slug}}));
    usleep(400000); // the token is stored after the (instant) answer
    auto row = testDb()->execSqlSync(
        "SELECT token FROM password_reset_tokens WHERE user_id = $1",
        s.user.id);
    ASSERT_EQ(row.size(), 1u);
    auto stored = row[0]["token"].as<std::string>();
    // the value at rest is not itself a usable token
    EXPECT_EQ(post("/api/auth/reset-password",
                   J({{"token", stored}, {"password", "newpassword1"}}))
                  .status, 400);
    auto tok = uniq("raw");
    testDb()->execSqlSync(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) "
        "VALUES ($1, $2, NOW() + INTERVAL '1 hour')", s.user.id,
        pyracms::sha256Hex(tok));
    EXPECT_EQ(get("/api/auth/me", s.user.token).status, 200);
    sleep(2); // tokens are stamped to the second
    auto reset = J({{"token", tok}, {"password", "newpassword1"}});
    EXPECT_EQ(post("/api/auth/reset-password", reset).status, 200);
    EXPECT_EQ(post("/api/auth/reset-password", reset).status, 400);
    EXPECT_EQ(get("/api/auth/me", s.user.token).status, 401); // old session
    auto again = post("/api/auth/login", creds(s.user.name, "newpassword1",
                                               s.slug));
    ASSERT_EQ(again.status, 200);
    EXPECT_EQ(get("/api/auth/me", again.json["token"].asString()).status, 200);
}
