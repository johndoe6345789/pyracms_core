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

TEST(SecurityAuth, RegistrationInputIsValidated) {
    REQUIRE_SERVER();
    auto n = uniq("rv");
    auto base = J({{"username", n}, {"email", n + "@h.test"},
                   {"password", "password123"}});
    auto with = [&](const char *k, Json::Value v) {
        Json::Value b = base;
        b[k] = v;
        return post("/api/auth/register", b).status;
    };
    EXPECT_EQ(with("username", "a b"), 400);
    EXPECT_EQ(with("username", "<script>x</script>"), 400);
    EXPECT_EQ(with("email", "x\r\nBcc: evil@x.co"), 400);
    EXPECT_EQ(with("email", "not-an-email"), 400);
    EXPECT_EQ(with("password", std::string(300, 'p')), 400);
    EXPECT_EQ(with("password", 12345678), 400);
    EXPECT_EQ(with("fullName", std::string(200, 'n')), 400);
    EXPECT_EQ(post("/api/auth/register", Json::Value(Json::arrayValue)).status,
              400);
    EXPECT_EQ(post("/api/auth/register", base).status, 201);
    // Same answer whether the name or the email clashed
    Json::Value clash = base;
    clash["username"] = n + "x";
    auto a = post("/api/auth/register", clash);
    auto b = post("/api/auth/register", base);
    EXPECT_EQ(a.status, 409);
    EXPECT_EQ(a.json["error"], b.json["error"]);
}
