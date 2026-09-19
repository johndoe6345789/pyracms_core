#include "db_fixture.h"
#include "services/UserService.h"

using namespace pyracms;

namespace {
UserService svc;

BoolResult create(const drogon::orm::DbClientPtr &db, int tenant,
                  const std::string &name) {
    return awaitBool([&](auto cb) {
        svc.createUser(db, tenant, name, name, name + "@t.test", "h", cb);
    });
}

std::optional<UserDto> find(const drogon::orm::DbClientPtr &db, int tenant,
                            const std::string &name) {
    return awaitValue<std::optional<UserDto>>(
        [&](auto cb) { svc.findByUsername(db, tenant, name, cb); });
}
} // namespace

TEST(UserScopeDb, SameUsernameAllowedInTwoScopes) {
    REQUIRE_DB();
    int a = makeTenant(db, uniq("ua")), b = makeTenant(db, uniq("ub"));
    EXPECT_TRUE(create(db, a, "richard").first);
    EXPECT_TRUE(create(db, b, "richard").first);
}

TEST(UserScopeDb, DuplicateInSameScopeRejected) {
    REQUIRE_DB();
    int a = makeTenant(db, uniq("uc"));
    EXPECT_TRUE(create(db, a, "dup").first);
    EXPECT_FALSE(create(db, a, "dup").first);
}

TEST(UserScopeDb, FindIsScoped) {
    REQUIRE_DB();
    int a = makeTenant(db, uniq("ud")), b = makeTenant(db, uniq("ue"));
    auto name = uniq("scoped");
    ASSERT_TRUE(create(db, a, name).first);
    auto hit = find(db, a, name);
    ASSERT_TRUE(hit);
    EXPECT_EQ(hit->tenantId, a);
    EXPECT_FALSE(find(db, b, name));
    EXPECT_FALSE(find(db, 0, name));
}

TEST(UserScopeDb, PlatformScopeIsTenantZero) {
    REQUIRE_DB();
    auto name = uniq("plat");
    ASSERT_TRUE(create(db, 0, name).first);
    auto hit = find(db, 0, name);
    ASSERT_TRUE(hit);
    EXPECT_EQ(hit->tenantId, 0);
}

TEST(UserScopeDb, PasswordHashLookupIsScoped) {
    REQUIRE_DB();
    int a = makeTenant(db, uniq("ug")), b = makeTenant(db, uniq("uh"));
    ASSERT_TRUE(create(db, a, "pw").first);
    auto get = [&](int t) {
        return awaitValue<std::optional<std::string>>(
            [&](auto cb) { svc.getPasswordHash(db, t, "pw", cb); });
    };
    EXPECT_TRUE(get(a));
    EXPECT_FALSE(get(b));
}
