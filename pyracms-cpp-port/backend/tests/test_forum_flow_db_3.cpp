#include "db_fixture.h"
#include "services/ForumService.h"

using namespace pyracms;

namespace {
ForumService svc;
using Id = std::pair<int, std::string>;

Id idOf(const std::function<void(ForumService::IdCallback)> &start) {
    return awaitValue<Id>([&](auto cb) {
        start([cb](int id, const std::string &e) { cb(Id{id, e}); });
    });
}

struct Fixture {
    int tenant, user, forum;
    Fixture(const drogon::orm::DbClientPtr &db) {
        tenant = makeTenant(db, uniq("ff"));
        user = makeUser(db, tenant, uniq("fu"));
        int cat = db->execSqlSync("INSERT INTO forum_categories "
                                  "(tenant_id, name) VALUES ($1, $2) "
                                  "RETURNING id",
                                  tenant, uniq("c"))[0]["id"]
                      .as<int>();
        forum = db->execSqlSync("INSERT INTO forums (name, category_id) "
                                "VALUES ('f', $1) RETURNING id",
                                cat)[0]["id"]
                    .as<int>();
    }
};
} // namespace

TEST(ForumFlowDb, ThreadUpdateFlagsAndDelete) {
    REQUIRE_DB();
    Fixture f(db);
    int mod = makeUser(db, f.tenant, uniq("mod"), 2);
    auto t = idOf([&](auto cb) {
        svc.createThread(db, f.forum, "T", "d", "b", f.user, f.tenant, cb);
    });
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.updateThread(db, t.first, f.user, "T2", "d2", cb);
                }).first);
    EXPECT_FALSE(awaitBool([&](auto cb) {
                     svc.setThreadFlags(db, t.first, f.user, true, false, cb);
                 }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.setThreadFlags(db, t.first, mod, true, true, cb);
                }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.deleteThread(db, t.first, f.user, cb);
                }).first);
}

TEST(ForumFlowDb, ListCategoriesAndGetForum) {
    REQUIRE_DB();
    Fixture f(db);
    using Cats = std::vector<ForumCategoryWithForumsDto>;
    auto cats = awaitValue<Cats>(
        [&](auto cb) { svc.listCategories(db, f.tenant, cb); });
    ASSERT_EQ(cats.size(), 1u);
    EXPECT_EQ(cats[0].forums.size(), 1u);
    auto forum = awaitValue<std::optional<ForumWithThreadsDto>>(
        [&](auto cb) { svc.getForum(db, f.forum, f.tenant, cb); });
    EXPECT_TRUE(forum);
    EXPECT_FALSE(awaitValue<std::optional<ForumWithThreadsDto>>(
        [&](auto cb) { svc.getForum(db, f.forum, f.tenant + 9999, cb); }));
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.createCategory(db, f.tenant, uniq("nc"), cb);
                }).first);
}
