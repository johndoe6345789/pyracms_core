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

TEST(ForumFlowDb, PostLifecycleAndVotes) {
    REQUIRE_DB();
    Fixture f(db);
    auto t = idOf([&](auto cb) {
        svc.createThread(db, f.forum, "T", "d", "b", f.user, f.tenant, cb);
    });
    auto p = idOf([&](auto cb) {
        svc.createPost(db, t.first, "re", "reply", f.user, cb);
    });
    ASSERT_GT(p.first, 0);
    auto upd = awaitBool([&](auto cb) {
        svc.updatePost(db, p.first, f.user, "re2", "edited", cb);
    });
    EXPECT_TRUE(upd.first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.votePost(db, p.first, f.user, true, cb);
                }).first);
    auto post = awaitValue<std::optional<ForumPostDto>>(
        [&](auto cb) { svc.getPost(db, p.first, cb); });
    ASSERT_TRUE(post);
    EXPECT_EQ(post->content, "edited");
    EXPECT_EQ(post->likes, 1);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.deletePost(db, p.first, f.user, cb);
                }).first);
}

TEST(ForumFlowDb, StrangerCannotEditOthersPost) {
    REQUIRE_DB();
    Fixture f(db);
    int stranger = makeUser(db, f.tenant, uniq("st"));
    auto t = idOf([&](auto cb) {
        svc.createThread(db, f.forum, "T", "d", "b", f.user, f.tenant, cb);
    });
    auto p = idOf(
        [&](auto cb) { svc.createPost(db, t.first, "x", "y", f.user, cb); });
    auto r = awaitBool([&](auto cb) {
        svc.updatePost(db, p.first, stranger, "h", "ijack", cb);
    });
    EXPECT_FALSE(r.first);
}
