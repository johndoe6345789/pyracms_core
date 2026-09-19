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

TEST(OwnerAdminUsers, OwnerCannotTouchAnotherSitesUsers) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto other = makeSite();
    auto t = o.owner.token;
    EXPECT_EQ(put(path(other.user, "/ban"), J({{"banned", true}}), t).status,
              403);
    EXPECT_EQ(put(path(other.user, "/role"), J({{"role", 2}}), t).status,
              403);
    EXPECT_EQ(put(path(other.user), J({{"fullName", "x"}}), t).status, 403);
    EXPECT_EQ(del(path(other.user), t).status, 403);
    EXPECT_FALSE(bannedOf(other.user));
    EXPECT_EQ(roleOf(other.user), 1);
}

TEST(OwnerAdminUsers, OwnerCannotTouchPlatformAccounts) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto plat = signup("", 1);
    EXPECT_EQ(put(path(plat, "/ban"), J({{"banned", true}}), o.owner.token)
                  .status, 403);
    EXPECT_FALSE(bannedOf(plat));
}

TEST(OwnerAdminUsers, OwnerListsAndReadsOwnSiteMembersWithEmail) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    auto q = "/api/users?limit=200&tenant_id=" + std::to_string(o.site.id);
    auto r = get(q, t);
    ASSERT_EQ(r.status, 200);
    bool found = false;
    for (const auto &u : r.json) {
        if (u["id"].asInt() != o.site.user.id)
            continue;
        found = true;
        EXPECT_TRUE(u.isMember("email"));
        EXPECT_TRUE(u.isMember("role"));
        EXPECT_TRUE(u.isMember("banned"));
    }
    EXPECT_TRUE(found);
    auto one = get(path(o.site.user), t);
    EXPECT_EQ(one.status, 200);
    EXPECT_TRUE(one.json.isMember("email"));
}

TEST(OwnerAdminUsers, OwnerListNamingForeignSiteShowsNothingOfIt) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto other = makeSite();
    auto r = get("/api/users?limit=200&tenant_id=" +
                     std::to_string(other.id), o.owner.token);
    ASSERT_EQ(r.status, 200);
    for (const auto &u : r.json)
        EXPECT_NE(u["id"].asInt(), other.user.id);
    EXPECT_EQ(get(path(other.user), o.owner.token).status, 404);
}
