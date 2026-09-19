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

TEST(SecurityAuth, ForgotPasswordAnswersIdenticallyForAnyAddress) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto known = post("/api/auth/forgot-password",
                      J({{"email", s.user.name + "@h.test"},
                         {"tenant", s.slug}}));
    auto unknown = post("/api/auth/forgot-password",
                        J({{"email", "nobody@h.test"}, {"tenant", s.slug}}));
    EXPECT_EQ(known.status, unknown.status);
    EXPECT_EQ(known.text, unknown.text);
    EXPECT_EQ(post("/api/auth/forgot-password", J({{"email", 5}})).status, 400);
}

TEST(SecurityAuth, ChangingThePasswordEndsOtherSessions) {
    REQUIRE_SERVER();
    auto u = signup("");
    sleep(2);
    auto r = put("/api/users/" + std::to_string(u.id) + "/password",
                 J({{"currentPassword", "password123"},
                    {"newPassword", "another-pass-9"}}), u.token);
    ASSERT_EQ(r.status, 200) << r.text;
    EXPECT_EQ(get("/api/auth/me", u.token).status, 401);
    EXPECT_EQ(get("/api/auth/me", r.json["token"].asString()).status, 200);
}
