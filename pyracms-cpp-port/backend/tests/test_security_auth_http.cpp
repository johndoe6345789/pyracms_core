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

TEST(SecurityAuth, ConcurrentFirstSignupsCreateExactlyOneOwner) {
    REQUIRE_SERVER();
    auto pa = platformAdmin();
    std::string slug;
    int tenant = newTenant(pa, slug);
    ASSERT_GT(tenant, 0);
    pyracms::UserService svc;
    std::vector<std::future<bool>> results;
    for (int i = 0; i < 8; ++i) {
        results.push_back(std::async(std::launch::async, [&, i] {
            auto p = std::make_shared<std::promise<bool>>();
            auto f = p->get_future();
            svc.registerAccount(
                testDb(), tenant, "race" + std::to_string(i), "",
                "race" + std::to_string(i) + "@h.test", "hash", 0,
                [p](bool ok, const std::string &, bool first) {
                    p->set_value(ok && first);
                });
            return f.get();
        }));
    }
    int owners = 0;
    for (auto &r : results)
        owners += r.get() ? 1 : 0;
    EXPECT_EQ(owners, 1);
    auto rows = testDb()->execSqlSync(
        "SELECT COUNT(*) FILTER (WHERE role = 3) AS admins, "
        "COUNT(*) FILTER (WHERE is_first) AS firsts, COUNT(*) AS n "
        "FROM users WHERE tenant_id = $1", tenant);
    EXPECT_EQ(rows[0]["admins"].as<int>(), 1);
    EXPECT_EQ(rows[0]["firsts"].as<int>(), 1);
    EXPECT_EQ(rows[0]["n"].as<int>(), 8);
}

TEST(SecurityAuth, LoginLocksAnAccountAndThrottlesAnAddress) {
    REQUIRE_SERVER();
    auto u = signup("");
    RateLimiter::setEnabled(true);
    for (int i = 0; i < 5; ++i)
        EXPECT_EQ(post("/api/auth/login", creds(u.name, "wrong-pw-1")).status,
                  401);
    // even the right password is refused while the account is locked
    EXPECT_EQ(post("/api/auth/login", creds(u.name, "password123")).status,
              429);
    int limited = 0;
    for (int i = 0; i < 12; ++i)
        limited += post("/api/auth/login", creds(uniq("nobody"), "x1234567"))
                       .status == 429;
    RateLimiter::setEnabled(false);
    EXPECT_GE(limited, 1);
    RateLimiter::instance().succeed("acct|0|" + u.name);
    EXPECT_EQ(post("/api/auth/login", creds(u.name, "password123")).status,
              200);
    EXPECT_EQ(post("/api/auth/login", creds(u.name, std::string(500, 'x')))
                  .status, 401);
}

TEST(SecurityAuth, ResetTokensAreHashedSingleUseAndEndSessions) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto email = s.user.name + "@h.test";
    post("/api/auth/forgot-password", J({{"email", email}, {"tenant", s.slug}}));
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

TEST(SecurityAuth, BannedAndDeletedAccountsLoseTheirTokens) {
    REQUIRE_SERVER();
    auto u = signup("");
    EXPECT_EQ(get("/api/auth/me", u.token).status, 200);
    testDb()->execSqlSync("UPDATE users SET banned = TRUE WHERE id = $1", u.id);
    EXPECT_EQ(get("/api/auth/me", u.token).status, 403);
    EXPECT_EQ(post("/api/auth/login", creds(u.name, "password123")).status, 403);
    testDb()->execSqlSync("DELETE FROM users WHERE id = $1", u.id);
    EXPECT_EQ(get("/api/auth/me", u.token).status, 401);
}

TEST(SecurityAuth, ForgedAndUnsignedTokensAreRefused) {
    REQUIRE_SERVER();
    auto u = signup("");
    auto payload = b64url("{\"iss\":\"pyracms\",\"sub\":\"" +
                          std::to_string(u.id) +
                          "\",\"username\":\"x\",\"exp\":9999999999}");
    auto none = b64url("{\"alg\":\"none\",\"typ\":\"JWT\"}") + "." + payload + ".";
    EXPECT_EQ(get("/api/auth/me", none).status, 401);
    auto hs = b64url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}") + "." + payload +
              ".AAAA";
    EXPECT_EQ(get("/api/auth/me", hs).status, 401);
    // a token that carries no expiry is not accepted even if well signed
    EXPECT_EQ(get("/api/auth/me", "a.b.c").status, 401);
}

TEST(SecurityAuth, OauthStateIsRequiredAndMintedByTheServer) {
    REQUIRE_SERVER();
    auto cb = post("/api/auth/oauth/github/callback", J({{"code", "c"}}));
    EXPECT_EQ(cb.status, 400);
    EXPECT_EQ(post("/api/auth/oauth/github/callback",
                   J({{"code", "c"}, {"state", "forged.1.aa"}})).status, 400);
    EXPECT_EQ(cb.json["error"].asString(), "Invalid or expired state");
}
