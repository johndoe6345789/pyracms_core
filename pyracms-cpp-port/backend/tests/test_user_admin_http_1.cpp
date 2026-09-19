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
bool bannedOf(const Acct &a) {
    auto r =
        testDb()->execSqlSync("SELECT banned FROM users WHERE id=$1", a.id);
    return r[0]["banned"].as<bool>();
}
} // namespace

TEST(UserAdminHttp, AdminEditsNameAndEmailOfMember) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto r = put(path(s.user),
                 J({{"fullName", "New Name"}, {"email", "nn@h.test"}}),
                 s.admin.token);
    EXPECT_EQ(r.status, 200);
    auto u = get(path(s.user), s.admin.token);
    EXPECT_EQ(u.json["fullName"].asString(), "New Name");
    EXPECT_EQ(u.json["email"].asString(), "nn@h.test");
}

TEST(UserAdminHttp, AdminCannotEditOtherFieldsOfMember) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto r = put(path(s.user), J({{"website", "https://x.test"}}),
                 s.admin.token);
    EXPECT_EQ(r.status, 403);
}

TEST(UserAdminHttp, PlainUserCannotEditOthers) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = signup(s.slug, 1);
    EXPECT_EQ(put(path(other), J({{"fullName", "x"}}), s.user.token).status,
              403);
    EXPECT_EQ(put(path(other, "/role"), J({{"role", 2}}), s.user.token).status,
              403);
    EXPECT_EQ(del(path(other), s.user.token).status, 403);
    EXPECT_EQ(roleOf(other), 1);
}

TEST(UserAdminHttp, SelfCannotChangeOwnRoleOrBan) {
    REQUIRE_SERVER();
    auto s = makeSite();
    EXPECT_EQ(put(path(s.user), J({{"role", 3}}), s.user.token).status, 403);
    EXPECT_EQ(
        put(path(s.admin, "/role"), J({{"role", 1}}), s.admin.token).status,
        403);
    EXPECT_EQ(roleOf(s.user), 1);
    EXPECT_EQ(roleOf(s.admin), 3);
}

TEST(UserAdminHttp, SelfProfileEditStillWorks) {
    REQUIRE_SERVER();
    auto s = makeSite();
    EXPECT_EQ(put(path(s.user), J({{"aboutme", "hi"}}), s.user.token).status,
              200);
}

TEST(UserAdminHttp, AdminOfOtherSiteCannotTouchUser) {
    REQUIRE_SERVER();
    auto a = makeSite(), b = makeSite();
    EXPECT_EQ(
        put(path(b.user, "/ban"), J({{"banned", true}}), a.admin.token).status,
        404);
    EXPECT_FALSE(bannedOf(b.user));
    EXPECT_EQ(del(path(b.user), a.admin.token).status, 404);
}
