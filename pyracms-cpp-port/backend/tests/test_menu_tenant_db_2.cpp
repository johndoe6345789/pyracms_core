#include "db_fixture.h"
#include "services/MenuService.h"
#include "services/TenantService.h"

using namespace pyracms;

namespace {
MenuService menus;

int makeGroup(const drogon::orm::DbClientPtr &db, int tenant) {
    return db
        ->execSqlSync(
            "INSERT INTO menu_groups (tenant_id, name) VALUES ($1, $2) "
            "RETURNING id",
            tenant, uniq("g"))[0]["id"]
        .as<int>();
}

BoolResult addItem(const drogon::orm::DbClientPtr &db, int group, int scope) {
    return awaitBool([&](auto cb) {
        menus.createMenuItem(db, "Home", "/", "", "route", group, 0, "", 0, "",
                             scope, cb);
    });
}
} // namespace

TEST(TenantDeleteDb, OnlyOwnerOrSuperAdminMayDelete) {
    REQUIRE_DB();
    TenantService tenants;
    int owner = makeUser(db, 0, uniq("own"));
    int rando = makeUser(db, 0, uniq("rnd"));
    int root = makeUser(db, 0, uniq("root"), 4);
    auto mk = [&] {
        int t = makeTenant(db, uniq("td"));
        db->execSqlSync("UPDATE tenants SET owner_id = $1 WHERE id = $2", owner,
                        t);
        return t;
    };
    auto del = [&](int t, int who) {
        return awaitBool(
            [&](auto cb) { tenants.deleteTenant(db, t, who, cb); });
    };
    int t1 = mk();
    EXPECT_FALSE(del(t1, rando).first);
    EXPECT_TRUE(del(t1, owner).first);
    EXPECT_TRUE(del(mk(), root).first);
}
