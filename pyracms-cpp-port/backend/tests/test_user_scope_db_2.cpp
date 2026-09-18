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

TEST(UserScopeDb, RoleRoundTripAndClamp) {
    REQUIRE_DB();
    int id = makeUser(db, 0, uniq("role"));
    auto set = awaitBool(
        [&](auto cb) { svc.setUserRole(db, id, UserRole::SiteAdmin, cb); });
    EXPECT_TRUE(set.first);
    auto get = [&] {
        return awaitValue<std::optional<UserRole>>(
            [&](auto cb) { svc.getUserRole(db, id, cb); });
    };
    EXPECT_EQ(get(), UserRole::SiteAdmin);
    db->execSqlSync("UPDATE users SET role = 99 WHERE id = $1", id);
    EXPECT_EQ(get(), UserRole::User);
}
