#include "http_accounts.h"

using namespace harness;

namespace {
std::string path(const Acct &a, const char *sfx = "") {
    return "/api/users/" + std::to_string(a.id) + sfx;
}
bool bannedOf(const Acct &a) {
    auto r =
        testDb()->execSqlSync("SELECT banned FROM users WHERE id=$1", a.id);
    return r[0]["banned"].as<bool>();
}
} // namespace

TEST(UserAdminHttp, PlatformOwnerActsOnAnySite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto pa = platformAdmin();
    EXPECT_EQ(
        put(path(s.user, "/ban"), J({{"banned", true}}), pa.token).status,
        200);
    EXPECT_TRUE(bannedOf(s.user));
}

TEST(UserAdminHttp, BadBodiesAre400) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto t = s.admin.token;
    EXPECT_EQ(put(path(s.user, "/ban"), J({{"banned", "yes"}}), t).status,
              400);
    EXPECT_EQ(put(path(s.user, "/role"), J({{"role", "x"}}), t).status, 400);
    EXPECT_EQ(put(path(s.user, "/role"), J({{"role", 9}}), t).status, 400);
    EXPECT_EQ(put(path(s.user), J({{"role", "x"}}), t).status, 400);
}

TEST(UserAdminHttp, NoTokenIs401) {
    REQUIRE_SERVER();
    EXPECT_EQ(del("/api/users/1").status, 401);
    EXPECT_EQ(put("/api/users/1/ban", J({{"banned", true}})).status, 401);
}

TEST(UserAdminHttp, ListShowsRolesToAdminsOnly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto find = [&](const std::string &tok) {
        auto r = get("/api/users?username=" + s.user.name, tok);
        return r.json.empty() ? Json::Value() : r.json[0];
    };
    EXPECT_EQ(find(s.admin.token)["role"].asInt(), 1);
    auto peer = signup(s.slug, 1);
    EXPECT_FALSE(find(peer.token).isMember("role"));
}
