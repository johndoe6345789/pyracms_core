#include "db_fixture.h"
#include "services/CodeSnippetService.h"
#include "services/MenuService.h"
#include "services/TenantService.h"
#include "services/UserService.h"

using namespace pyracms;

TEST(UserCrudDb, FindByIdEmailListUpdatePasswordDelete) {
    REQUIRE_DB();
    UserService svc;
    int t = makeTenant(db, uniq("uc"));
    auto name = uniq("crud");
    int id = makeUser(db, t, name);
    using U = std::optional<UserDto>;
    auto byId = awaitValue<U>([&](auto cb) { svc.findById(db, id, cb); });
    ASSERT_TRUE(byId);
    EXPECT_EQ(byId->username, name);
    EXPECT_TRUE(awaitValue<U>(
        [&](auto cb) { svc.findByEmail(db, t, name + "@t.test", cb); }));
    EXPECT_FALSE(awaitValue<U>(
        [&](auto cb) { svc.findByEmail(db, 0, name + "@t.test", cb); }));
    auto all = awaitValue<std::vector<UserDto>>(
        [&](auto cb) { svc.listUsers(db, 5, 0, cb); });
    EXPECT_FALSE(all.empty());
    Json::Value upd;
    upd["website"] = "https://x.test";
    upd["aboutme"] = "hi";
    EXPECT_TRUE(
        awaitBool([&](auto cb) { svc.updateUser(db, id, upd, cb); }).first);
    EXPECT_FALSE(awaitBool([&](auto cb) {
                     svc.updateUser(db, id, Json::Value(), cb);
                 }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.updatePassword(db, id, "newhash", cb);
                }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) { svc.deleteUser(db, id, cb); }).first);
    EXPECT_FALSE(awaitValue<U>([&](auto cb) { svc.findById(db, id, cb); }));
}

TEST(TenantCrudDb, CreateFindList) {
    REQUIRE_DB();
    TenantService svc;
    int owner = makeUser(db, 0, uniq("own"));
    auto slug = uniq("crud-t");
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.createTenant(db, slug, "Crud", "d", owner, cb);
                }).first);
    using T = std::optional<TenantDto>;
    auto found = awaitValue<T>([&](auto cb) { svc.findBySlug(db, slug, cb); });
    ASSERT_TRUE(found);
    EXPECT_EQ(found->slug, slug);
    EXPECT_FALSE(awaitValue<T>(
        [&](auto cb) { svc.findBySlug(db, "nope-" + slug, cb); }));
    auto all = awaitValue<std::vector<TenantDto>>(
        [&](auto cb) { svc.listTenants(db, cb); });
    EXPECT_FALSE(all.empty());
}

TEST(MenuCrudDb, GroupsAndItemsList) {
    REQUIRE_DB();
    MenuService svc;
    int t = makeTenant(db, uniq("mn"));
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.createMenuGroup(db, t, "main", cb);
                }).first);
    using G = std::vector<MenuGroupDto>;
    auto groups =
        awaitValue<G>([&](auto cb) { svc.listMenuGroups(db, t, cb); });
    ASSERT_EQ(groups.size(), 1u);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.createMenuItem(db, "Home", "/", "", "route",
                                       groups[0].id, 0, "", t, cb);
                }).first);
    auto items = awaitValue<std::vector<MenuItemDto>>(
        [&](auto cb) { svc.listMenuItems(db, groups[0].id, cb); });
    ASSERT_EQ(items.size(), 1u);
    EXPECT_EQ(items[0].type, "route");
}
