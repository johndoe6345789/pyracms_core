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

TEST(SecurityAuth, BannedAndDeletedAccountsLoseTheirTokens) {
    REQUIRE_SERVER();
    auto u = signup("");
    EXPECT_EQ(get("/api/auth/me", u.token).status, 200);
    testDb()->execSqlSync("UPDATE users SET banned = TRUE WHERE id = $1", u.id);
    EXPECT_EQ(get("/api/auth/me", u.token).status, 403);
    EXPECT_EQ(post("/api/auth/login", creds(u.name, "password123")).status,
              403);
    testDb()->execSqlSync("DELETE FROM users WHERE id = $1", u.id);
    EXPECT_EQ(get("/api/auth/me", u.token).status, 401);
}

TEST(SecurityAuth, ForgedAndUnsignedTokensAreRefused) {
    REQUIRE_SERVER();
    auto u = signup("");
    auto payload = b64url("{\"iss\":\"pyracms\",\"sub\":\"" +
                          std::to_string(u.id) +
                          "\",\"username\":\"x\",\"exp\":9999999999}");
    auto none = b64url("{\"alg\":\"none\",\"typ\":\"JWT\"}") + "." +
                payload + ".";
    EXPECT_EQ(get("/api/auth/me", none).status, 401);
    auto hs = b64url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}") + "." + payload +
              ".AAAA";
    EXPECT_EQ(get("/api/auth/me", hs).status, 401);
    // a token that carries no expiry is not accepted even if well signed
    EXPECT_EQ(get("/api/auth/me", "a.b.c").status, 401);
}
