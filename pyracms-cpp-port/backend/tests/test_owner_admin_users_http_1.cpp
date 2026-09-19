#include "owner_scope_support.h"

using namespace harness;

namespace {
std::string path(const Acct &a, const char *sfx = "") {
    return "/api/users/" + std::to_string(a.id) + sfx;
}
int roleOf(const Acct &a) {
    auto r = testDb()->execSqlSync("SELECT role FROM users WHERE id=$1", a.id);
    return r[0]["role"].as<int>();
}
bool bannedOf(const Acct &a) {
    auto r =
        testDb()->execSqlSync("SELECT banned FROM users WHERE id=$1", a.id);
    return r[0]["banned"].as<bool>();
}
} // namespace

TEST(OwnerAdminUsers, OwnerBansAndRolesMemberOfOwnSite) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    auto &m = o.site.user;
    EXPECT_EQ(put(path(m, "/ban"), J({{"banned", true}}), t).status, 200);
    EXPECT_TRUE(bannedOf(m));
    EXPECT_EQ(put(path(m, "/role"), J({{"role", 2}}), t).status, 200);
    EXPECT_EQ(roleOf(m), 2);
    EXPECT_EQ(put(path(m, "/role"), J({{"role", 3}}), t).status, 200);
    EXPECT_EQ(put(path(m, "/role"), J({{"role", 4}}), t).status, 403);
    EXPECT_EQ(roleOf(m), 3);
    EXPECT_EQ(put(path(m), J({{"fullName", "Named"}, {"banned", false}}), t)
                  .status, 200);
    EXPECT_FALSE(bannedOf(m));
}

TEST(OwnerAdminUsers, OwnerActsOnSiteAdministratorButNotOnSelf) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    EXPECT_EQ(put(path(o.site.admin, "/role"), J({{"role", 1}}), t).status,
              200);
    EXPECT_EQ(put(path(o.owner, "/ban"), J({{"banned", true}}), t).status,
              403);
    EXPECT_FALSE(bannedOf(o.owner));
}

TEST(OwnerAdminUsers, OwnerDeletesMemberOfOwnSite) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    EXPECT_EQ(del(path(o.site.user), o.owner.token).status, 200);
    auto r = testDb()->execSqlSync("SELECT 1 FROM users WHERE id=$1",
                                   o.site.user.id);
    EXPECT_TRUE(r.empty());
}
