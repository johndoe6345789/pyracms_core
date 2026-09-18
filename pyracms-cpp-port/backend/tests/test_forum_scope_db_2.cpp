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

TEST(ForumScopeDb, ForumUpdateAndDeleteAreScoped) {
    REQUIRE_DB();
    int t = makeTenant(db, uniq("fi")), other = makeTenant(db, uniq("fj"));
    int c = makeCategory(db, t);
    int f = db->execSqlSync(
                  "INSERT INTO forums (name, category_id) VALUES ('x', $1) "
                  "RETURNING id",
                  c)[0]["id"]
                .as<int>();
    EXPECT_FALSE(awaitBool([&](auto cb) {
                     svc.updateForum(db, f, "n", "d", other, cb);
                 }).first);
    EXPECT_FALSE(
        awaitBool([&](auto cb) { svc.deleteForum(db, f, other, cb); }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.updateForum(db, f, "n", "d", t, cb);
                }).first);
    EXPECT_TRUE(
        awaitBool([&](auto cb) { svc.deleteForum(db, f, t, cb); }).first);
}
