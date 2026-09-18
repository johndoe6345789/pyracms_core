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

TEST(ForumFlowDb, ThreadWithFirstPostRoundTrip) {
    REQUIRE_DB();
    Fixture f(db);
    auto t = idOf([&](auto cb) {
        svc.createThread(db, f.forum, "Hello", "d", "body", f.user, f.tenant,
                         cb);
    });
    ASSERT_GT(t.first, 0) << t.second;
    auto got = awaitValue<std::optional<ForumThreadWithPostsDto>>(
        [&](auto cb) { svc.getThread(db, t.first, f.tenant, cb); });
    ASSERT_TRUE(got);
    EXPECT_EQ(got->thread.name, "Hello");
    EXPECT_EQ(got->thread.authorUsername.empty(), false);
    EXPECT_EQ(got->posts.size(), 1u);
}

TEST(ForumFlowDb, ThreadInvisibleToOtherTenant) {
    REQUIRE_DB();
    Fixture f(db);
    int other = makeTenant(db, uniq("fo"));
    auto t = idOf([&](auto cb) {
        svc.createThread(db, f.forum, "T", "d", "b", f.user, f.tenant, cb);
    });
    auto got = awaitValue<std::optional<ForumThreadWithPostsDto>>(
        [&](auto cb) { svc.getThread(db, t.first, other, cb); });
    EXPECT_FALSE(got);
}
