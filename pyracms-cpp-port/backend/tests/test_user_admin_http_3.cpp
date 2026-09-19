#include "http_accounts.h"

using namespace harness;

namespace {
std::string path(const Acct &a, const char *sfx = "") {
    return "/api/users/" + std::to_string(a.id) + sfx;
}
int roleOf(const Acct &a) {
    auto r = testDb()->execSqlSync("SELECT role FROM users WHERE id=$1", a.id);
    return r[0]["role"].as<int>();
}
bool exists(const Acct &a) {
    return testDb()->execSqlSync("SELECT 1 FROM users WHERE id=$1", a.id)
               .size() == 1;
}
Json::Value ban(bool b) { return J({{"banned", b}}); }
} // namespace

TEST(UserAdminHttp, BanBlocksTokenImmediatelyAndUnbanRestoresLogin) {
    REQUIRE_SERVER();
    auto s = makeSite();
    EXPECT_EQ(get("/api/auth/me", s.user.token).status, 200);
    EXPECT_EQ(put(path(s.user, "/ban"), ban(true), s.admin.token).status,
              200);
    EXPECT_EQ(get("/api/auth/me", s.user.token).status, 403);
    EXPECT_EQ(put(path(s.user, "/ban"), ban(false), s.admin.token).status,
              200);
    // Unbanned: a fresh login works.
    auto login = post("/api/auth/login",
                      J({{"username", s.user.name},
                         {"password", "password123"},
                         {"tenant", s.slug}}));
    EXPECT_EQ(login.status, 200);
}

TEST(UserAdminHttp, BanViaUpdateRoute) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto body = J({{"fullName", "B"}, {"banned", true}});
    EXPECT_EQ(put(path(s.user), body, s.admin.token).status, 200);
    EXPECT_EQ(get("/api/auth/me", s.user.token).status, 403);
}

TEST(UserAdminHttp, AdminCannotBanOrDeleteEqualRole) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto peer = signup(s.slug, 3);
    EXPECT_EQ(put(path(peer, "/ban"), ban(true), s.admin.token).status, 403);
    EXPECT_EQ(del(path(peer), s.admin.token).status, 403);
    EXPECT_TRUE(exists(peer));
}

TEST(UserAdminHttp, RoleChangeAndGrantLimits) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto role = [&](int r, const std::string &tok) {
        return put(path(s.user, "/role"), J({{"role", r}}), tok).status;
    };
    EXPECT_EQ(role(2, s.admin.token), 200);
    EXPECT_EQ(roleOf(s.user), 2);
    EXPECT_EQ(role(3, s.admin.token), 403);
    EXPECT_EQ(role(4, s.admin.token), 403);
    EXPECT_EQ(roleOf(s.user), 2);
    auto pa = platformAdmin();
    EXPECT_EQ(put(path(s.user), J({{"role", 3}}), pa.token).status, 200);
    EXPECT_EQ(roleOf(s.user), 3);
}
