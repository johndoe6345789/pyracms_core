#include "db_fixture.h"
#include "services/ForumService.h"

using namespace pyracms;

namespace {
ForumService svc;

int makeCategory(const drogon::orm::DbClientPtr &db, int tenant) {
    return db
        ->execSqlSync("INSERT INTO forum_categories (tenant_id, name) "
                      "VALUES ($1, $2) RETURNING id",
                      tenant, uniq("cat"))[0]["id"]
        .as<int>();
}
} // namespace

TEST(ForumScopeDb, OwnTenantMayRenameCategory) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("fa"));
    int c = makeCategory(db, t);
    auto r = awaitBool(
        [&](auto cb) { svc.updateCategory(db, c, "renamed", t, cb); });
    EXPECT_TRUE(r.first);
}

TEST(ForumScopeDb, ForeignTenantCannotRenameCategory) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("fb")), other = makeTenant(db, uniq("fc"));
    int c = makeCategory(db, t);
    auto r = awaitBool(
        [&](auto cb) { svc.updateCategory(db, c, "hijack", other, cb); });
    EXPECT_FALSE(r.first);
    EXPECT_EQ(r.second, "Not found");
}

TEST(ForumScopeDb, PlatformScopeMayDeleteAnyCategory) {
    REQUIRE_DB();
    int c = makeCategory(db, makeTenant(db, uniq("fd")));
    auto r = awaitBool([&](auto cb) { svc.deleteCategory(db, c, 0, cb); });
    EXPECT_TRUE(r.first);
}

TEST(ForumScopeDb, ForeignTenantCannotDeleteCategory) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("fe")), other = makeTenant(db, uniq("ff"));
    int c = makeCategory(db, t);
    auto r = awaitBool([&](auto cb) { svc.deleteCategory(db, c, other, cb); });
    EXPECT_FALSE(r.first);
}

TEST(ForumScopeDb, CreateForumRequiresCategoryInScope) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("fg")), other = makeTenant(db, uniq("fh"));
    int c = makeCategory(db, t);
    auto bad = awaitBool(
        [&](auto cb) { svc.createForum(db, c, "f1", "d", other, cb); });
    EXPECT_FALSE(bad.first);
    auto ok =
        awaitBool([&](auto cb) { svc.createForum(db, c, "f1", "d", t, cb); });
    EXPECT_TRUE(ok.first);
}
