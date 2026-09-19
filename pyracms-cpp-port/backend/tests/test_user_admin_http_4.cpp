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

TEST(UserAdminHttp, DemotionTakesEffectOnExistingToken) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto pa = platformAdmin();
    auto victim = signup(s.slug, 1);
    EXPECT_EQ(put(path(victim, "/ban"), ban(true), s.admin.token).status,
              200);
    EXPECT_EQ(put(path(s.admin, "/role"), J({{"role", 1}}), pa.token).status,
              200);
    // Denied either way: 401 when the demotion already revoked the old
    // token (clock second rolled over), 403 when it is still accepted but
    // the account is no longer an administrator.
    int st = put(path(victim, "/ban"), ban(false), s.admin.token).status;
    EXPECT_TRUE(st == 401 || st == 403) << st;
}

TEST(UserAdminHttp, SiteOwnerProtectedFromNonOwners) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto boss = signup(s.slug, 2);
    testDb()->execSqlSync("UPDATE tenants SET owner_id=$1 WHERE id=$2",
                          boss.id, s.id);
    auto down = J({{"role", 1}});
    EXPECT_EQ(put(path(boss, "/ban"), ban(true), s.admin.token).status, 403);
    EXPECT_EQ(put(path(boss, "/role"), down, s.admin.token).status, 403);
    EXPECT_EQ(del(path(boss), s.admin.token).status, 403);
    EXPECT_EQ(roleOf(boss), 2);
    auto pa = platformAdmin();
    EXPECT_EQ(put(path(boss, "/role"), down, pa.token).status, 200);
}

TEST(UserAdminHttp, DeleteRemovesAccountAndToken) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto v = signup(s.slug, 1);
    EXPECT_EQ(del(path(v), s.admin.token).status, 200);
    EXPECT_FALSE(exists(v));
    EXPECT_EQ(get("/api/auth/me", v.token).status, 401);
    EXPECT_EQ(del(path(v), s.admin.token).status, 404);
}

TEST(UserAdminHttp, CannotDeleteOrBanSelf) {
    REQUIRE_SERVER();
    auto s = makeSite();
    EXPECT_EQ(del(path(s.admin), s.admin.token).status, 403);
    EXPECT_EQ(put(path(s.admin, "/ban"), ban(true), s.admin.token).status,
              403);
    EXPECT_TRUE(exists(s.admin));
}
