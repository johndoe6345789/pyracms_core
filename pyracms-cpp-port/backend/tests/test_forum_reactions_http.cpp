#include "owner_scope_support.h"

using namespace harness;

namespace {
struct Board {
    Site s;
    int tid{0};
    int pid{0};
};
Board board() {
    Board b;
    b.s = makeSite();
    auto [cid, fid] = seedBoard(b.s);
    auto th = post("/api/forum/threads",
                   J({{"forumId", fid}, {"title", "T"}, {"content", "c"},
                      {"tenantId", b.s.id}}), b.s.user.token);
    b.tid = th.json["id"].asInt();
    b.pid = post("/api/forum/posts", J({{"threadId", b.tid},
                 {"content", "hi"}}), b.s.user.token).json["id"].asInt();
    return b;
}
std::string rx(int pid) {
    return "/api/forum/posts/" + std::to_string(pid) + "/reactions";
}
Json::Value postOf(const Board &b, const std::string &tok = "") {
    auto r = get("/api/forum/threads/" + std::to_string(b.tid), tok);
    for (const auto &p : r.json["posts"])
        if (p["id"].asInt() == b.pid)
            return p;
    return Json::Value();
}
} // namespace

TEST(ForumReactions, ToggleCountsAndMineOnlyWithToken) {
    REQUIRE_SERVER();
    auto b = board();
    auto u = b.s.user.token, a = b.s.admin.token;
    auto r = put(rx(b.pid), J({{"emoji", "heart"}}), u);
    ASSERT_EQ(r.status, 200);
    EXPECT_EQ(r.json["reactions"][0]["count"].asInt(), 1);
    EXPECT_TRUE(r.json["reactions"][0]["mine"].asBool());
    put(rx(b.pid), J({{"emoji", "heart"}}), a);
    auto mine = postOf(b, u)["reactions"][0];
    EXPECT_EQ(mine["emoji"].asString(), "heart");
    EXPECT_EQ(mine["count"].asInt(), 2);
    EXPECT_TRUE(mine["mine"].asBool());
    EXPECT_FALSE(postOf(b)["reactions"][0]["mine"].asBool());
    // Same emoji again toggles the caller's reaction off.
    put(rx(b.pid), J({{"emoji", "heart"}}), a);
    EXPECT_EQ(postOf(b)["reactions"][0]["count"].asInt(), 1);
    put(rx(b.pid), J({{"emoji", "party"}}), u);
    EXPECT_EQ(postOf(b)["reactions"].size(), 2u);
    EXPECT_EQ(del(rx(b.pid) + "/party", u).status, 200);
    EXPECT_EQ(postOf(b)["reactions"].size(), 1u);
    EXPECT_EQ(del(rx(b.pid) + "/party", u).status, 200);
}

TEST(ForumReactions, ValidationAndTenantIsolation) {
    REQUIRE_SERVER();
    auto b = board();
    auto other = makeSite();
    auto u = b.s.user.token;
    EXPECT_EQ(put(rx(b.pid), J({{"emoji", "poop"}}), u).status, 400);
    EXPECT_EQ(put(rx(b.pid), J({{"x", 1}}), u).status, 400);
    EXPECT_EQ(del(rx(b.pid) + "/poop", u).status, 400);
    EXPECT_EQ(put(rx(b.pid), J({{"emoji", "wow"}})).status, 401);
    EXPECT_EQ(put(rx(999999999), J({{"emoji", "wow"}}), u).status, 404);
    auto foreign = other.user.token;
    EXPECT_EQ(put(rx(b.pid), J({{"emoji", "wow"}}), foreign).status, 404);
    EXPECT_EQ(del(rx(b.pid) + "/wow", foreign).status, 404);
    EXPECT_TRUE(postOf(b)["reactions"].empty());
}
