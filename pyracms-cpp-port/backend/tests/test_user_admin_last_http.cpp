#include "user_admin_last_support.h"

using namespace harness;

namespace {
std::string path(const Acct &a, const char *sfx = "") {
    return userPath(a, sfx);
}
int roleOf(const Acct &a) {
    auto r = testDb()->execSqlSync("SELECT role FROM users WHERE id=$1", a.id);
    return r[0]["role"].as<int>();
}
} // namespace

TEST(UserAdminLastHttp, LastAdministratorCannotBeRemovedEvenByPlatform) {
    REQUIRE_SERVER();
    auto s = adminOnlySite();
    auto pa = platformAdmin();
    EXPECT_EQ(put(path(s.admin, "/role"), J({{"role", 1}}), pa.token).status,
              409);
    EXPECT_EQ(put(path(s.admin), J({{"role", 1}}), pa.token).status, 409);
    EXPECT_EQ(
        put(path(s.admin, "/ban"), J({{"banned", true}}), pa.token).status,
        409);
    EXPECT_EQ(del(path(s.admin), pa.token).status, 409);
    EXPECT_EQ(roleOf(s.admin), 3);
}

TEST(UserAdminLastHttp, ASecondAdministratorFreesTheFirst) {
    REQUIRE_SERVER();
    auto s = adminOnlySite();
    auto pa = platformAdmin();
    auto second = signup(s.slug, 3);
    EXPECT_EQ(put(path(s.admin, "/role"), J({{"role", 1}}), pa.token).status,
              200);
    EXPECT_EQ(del(path(second), pa.token).status, 409);
    EXPECT_EQ(roleOf(second), 3);
}

TEST(UserAdminLastHttp, SiteOwnerCountsAsAnAdministrator) {
    REQUIRE_SERVER();
    auto s = adminOnlySite();
    auto pa = platformAdmin();
    testDb()->execSqlSync("UPDATE tenants SET owner_id=$1 WHERE id=$2",
                          s.user.id, s.id);
    EXPECT_EQ(del(path(s.admin), pa.token).status, 200);
    EXPECT_EQ(del(path(s.user), pa.token).status, 409);
}
