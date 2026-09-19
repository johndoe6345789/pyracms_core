#include "owner_scope_support.h"

using namespace harness;

namespace {
struct Thread {
    int tid{0};
    int pid{0};
};
Thread memberThread(const OwnedSite &o) {
    auto [cid, fid] = seedBoard(o.site);
    auto u = o.site.user.token;
    auto th = post("/api/forum/threads",
                   J({{"forumId", fid}, {"title", "T"}, {"content", "c"},
                      {"tenantId", o.site.id}}), u);
    Thread r;
    r.tid = th.json["id"].asInt();
    auto p = post("/api/forum/posts",
                  J({{"threadId", r.tid}, {"content", "hi"},
                     {"title", "re"}}), u);
    r.pid = p.json["id"].asInt();
    return r;
}
} // namespace

TEST(OwnerAdminForum, OwnerModeratesMembersThreadsAndPosts) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto t = o.owner.token;
    auto th = memberThread(o);
    auto ts = std::to_string(th.tid), ps = std::to_string(th.pid);
    EXPECT_EQ(put("/api/forum/threads/" + ts, J({{"title", "N"}}), t).status,
              200);
    EXPECT_EQ(put("/api/forum/threads/" + ts + "/flags",
                  J({{"pinned", true}, {"locked", true}}), t).status, 200);
    EXPECT_EQ(put("/api/forum/posts/" + ps,
                  J({{"content", "e"}, {"title", "x"}}), t).status, 200);
    EXPECT_EQ(del("/api/forum/posts/" + ps, t).status, 200);
    EXPECT_EQ(del("/api/forum/threads/" + ts, t).status, 200);
}

TEST(OwnerAdminForum, OwnerCannotModerateAnotherSite) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto other = ownedSite();
    auto th = memberThread(other);
    auto ts = std::to_string(th.tid), ps = std::to_string(th.pid);
    auto t = o.owner.token;
    EXPECT_NE(put("/api/forum/threads/" + ts, J({{"title", "N"}}), t).status,
              200);
    EXPECT_NE(put("/api/forum/threads/" + ts + "/flags",
                  J({{"pinned", true}, {"locked", true}}), t).status, 200);
    EXPECT_NE(del("/api/forum/posts/" + ps, t).status, 200);
    EXPECT_NE(del("/api/forum/threads/" + ts, t).status, 200);
    auto r = testDb()->execSqlSync(
        "SELECT name, is_pinned FROM forum_threads WHERE id=$1", th.tid);
    ASSERT_EQ(r.size(), 1u);
    EXPECT_EQ(r[0]["name"].as<std::string>(), "T");
    EXPECT_FALSE(r[0]["is_pinned"].as<bool>());
}
