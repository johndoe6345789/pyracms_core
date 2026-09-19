#include "owner_scope_support.h"

using namespace harness;

namespace {
struct Rig {
    Site s;
    int fid{0}, fid2{0}, tid{0};
};
Rig rig() {
    Rig r;
    r.s = makeSite();
    auto [cid, fid] = seedBoard(r.s);
    post("/api/forum/forums", J({{"categoryId", cid}, {"name", "F2"}}),
         r.s.admin.token);
    r.fid = fid;
    r.fid2 = maxId("forums");
    auto th = post("/api/forum/threads", J({{"forumId", fid},
                   {"title", "T"}, {"content", "c"}, {"tenantId", r.s.id}}),
                   r.s.user.token);
    r.tid = th.json["id"].asInt();
    return r;
}
std::string mv(int tid) {
    return "/api/forum/threads/" + std::to_string(tid) + "/move";
}
} // namespace

TEST(ForumMove, ModeratorMovesWithinSiteOnly) {
    REQUIRE_SERVER();
    auto r = rig();
    auto other = rig();
    auto body = J({{"forumId", r.fid2}});
    EXPECT_EQ(put(mv(r.tid), body, r.s.user.token).status, 404);
    EXPECT_EQ(put(mv(r.tid), J({{"x", 1}}), r.s.admin.token).status, 400);
    EXPECT_EQ(put(mv(r.tid), body).status, 401);
    // A forum of another site is refused, as is another site's admin.
    EXPECT_EQ(put(mv(r.tid), J({{"forumId", other.fid}}),
                  r.s.admin.token).status, 404);
    EXPECT_EQ(put(mv(r.tid), body, other.s.admin.token).status, 404);
    ASSERT_EQ(put(mv(r.tid), body, r.s.admin.token).status, 200);
    auto t = get("/api/forum/threads/" + std::to_string(r.tid));
    EXPECT_EQ(t.json["forumId"].asInt(), r.fid2);
    auto n = testDb()->execSqlSync("SELECT total_threads FROM forums "
                                   "WHERE id = $1", r.fid2);
    EXPECT_EQ(n[0][0].as<int>(), 1);
    EXPECT_EQ(put(mv(r.tid), body, r.s.admin.token).status, 200);
    EXPECT_EQ(put(mv(r.tid), J({{"forumId", 999999999}}),
                  r.s.admin.token).status, 404);
}

TEST(ForumMove, SiteOwnerMovesButNotOnAnotherSite) {
    REQUIRE_SERVER();
    auto r = rig();
    auto o = ownedSite();
    auto [cid, fid] = seedBoard(o.site);
    auto th = post("/api/forum/threads", J({{"forumId", fid},
                   {"title", "T"}, {"content", "c"},
                   {"tenantId", o.site.id}}), o.site.user.token);
    int tid = th.json["id"].asInt();
    post("/api/forum/forums", J({{"categoryId", cid}, {"name", "F9"}}),
         o.site.admin.token);
    auto dest = J({{"forumId", maxId("forums")}});
    EXPECT_EQ(put(mv(r.tid), dest, o.owner.token).status, 404);
    EXPECT_EQ(put(mv(tid), dest, o.owner.token).status, 200);
}
