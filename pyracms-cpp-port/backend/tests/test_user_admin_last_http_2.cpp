#include "user_admin_last_support.h"

using namespace harness;

namespace {
std::string path(const Acct &a, const char *sfx = "") {
    return userPath(a, sfx);
}
Json::Value listed(const Acct &who, const Acct &viewer) {
    auto r = get("/api/users?limit=200", viewer.token);
    for (const auto &u : r.json)
        if (u["id"].asInt() == who.id)
            return u;
    return Json::Value();
}
} // namespace

TEST(UserAdminLastHttp, ListFlagsOwnerAndLastAdmin) {
    REQUIRE_SERVER();
    auto s = adminOnlySite();
    auto a = listed(s.admin, s.admin);
    EXPECT_TRUE(a["lastAdmin"].asBool());
    EXPECT_FALSE(a["siteOwner"].asBool());
    EXPECT_FALSE(listed(s.user, s.admin)["lastAdmin"].asBool());
    testDb()->execSqlSync("UPDATE tenants SET owner_id=$1 WHERE id=$2",
                          s.user.id, s.id);
    auto u = listed(s.user, s.admin);
    EXPECT_TRUE(u["siteOwner"].asBool());
    EXPECT_FALSE(u["lastAdmin"].asBool()); // admin still there
}

TEST(UserAdminLastHttp, RoleChangeThroughProfileRouteIsAudited) {
    REQUIRE_SERVER();
    auto s = adminOnlySite();
    EXPECT_EQ(put(path(s.user), J({{"role", 2}}), s.admin.token).status,
              200);
    sleep(1);
    auto r = get("/api/audit?tenant_id=" + std::to_string(s.id),
                 s.admin.token);
    ASSERT_EQ(r.status, 200);
    bool seen = false;
    for (const auto &e : r.json)
        seen = seen || e["action"].asString() == "user.role";
    EXPECT_TRUE(seen);
}
