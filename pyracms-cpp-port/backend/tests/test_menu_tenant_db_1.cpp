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
        menus.createMenuItem(db, "Home", "/", "", "route", group, 0, "", 0,
                             scope, cb);
    });
}
} // namespace

TEST(MenuScopeDb, MenuItemsTableExists) {
    REQUIRE_DB();
    auto r = db->execSqlSync("SELECT to_regclass('public.menu_items') AS t");
    EXPECT_FALSE(r[0]["t"].isNull());
}

TEST(MenuScopeDb, CreateItemChecksGroupTenant) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("ma")), other = makeTenant(db, uniq("mb"));
    int g = makeGroup(db, t);
    EXPECT_FALSE(addItem(db, g, other).first);
    EXPECT_TRUE(addItem(db, g, t).first);
    EXPECT_TRUE(addItem(db, g, 0).first);
}

TEST(MenuScopeDb, UpdateAndDeleteItemAreScoped) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("mc")), other = makeTenant(db, uniq("md"));
    int g = makeGroup(db, t);
    ASSERT_TRUE(addItem(db, g, t).first);
    int id = db->execSqlSync("SELECT id FROM menu_items WHERE group_id = $1",
                             g)[0]["id"]
                 .as<int>();
    Json::Value upd;
    upd["name"] = "Renamed";
    EXPECT_FALSE(awaitBool([&](auto cb) {
                     menus.updateMenuItem(db, id, upd, other, cb);
                 }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    menus.updateMenuItem(db, id, upd, t, cb);
                }).first);
    EXPECT_FALSE(awaitBool([&](auto cb) {
                     menus.deleteMenuItem(db, id, other, cb);
                 }).first);
    EXPECT_TRUE(
        awaitBool([&](auto cb) { menus.deleteMenuItem(db, id, t, cb); }).first);
}

TEST(MenuScopeDb, DeleteGroupIsScoped) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("me")), other = makeTenant(db, uniq("mf"));
    int g = makeGroup(db, t);
    EXPECT_FALSE(awaitBool([&](auto cb) {
                     menus.deleteMenuGroup(db, g, other, cb);
                 }).first);
    EXPECT_TRUE(
        awaitBool([&](auto cb) { menus.deleteMenuGroup(db, g, t, cb); }).first);
}
