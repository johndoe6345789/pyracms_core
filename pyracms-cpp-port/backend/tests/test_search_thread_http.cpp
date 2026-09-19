#include "owner_scope_support.h"

using namespace harness;

TEST(SearchThread, ForumHitsCarryThreadAndPostIds) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto [cid, fid] = seedBoard(s);
    auto th = post("/api/forum/threads", J({{"forumId", fid},
                   {"title", "Zebra talk"}, {"content", "zebra herd"},
                   {"tenantId", s.id}}), s.user.token);
    int tid = th.json["id"].asInt();
    auto q = "&tenant_id=" + std::to_string(s.id);
    for (auto type : {"forum_post", "post"}) {
        auto r = get(std::string("/api/search?q=zebra&type=") + type + q);
        ASSERT_EQ(r.status, 200) << type;
        ASSERT_GE(r.json["items"].size(), 1u) << type;
        const auto &item = r.json["items"][0];
        EXPECT_EQ(item["threadId"].asInt(), tid);
        EXPECT_GT(item["postId"].asInt(), 0);
        EXPECT_EQ(item["postId"].asInt(), item["id"].asInt());
        EXPECT_FALSE(item["snippet"].asString().empty());
    }
    auto other = makeSite();
    auto foreign = get("/api/search?q=zebra&type=post&tenant_id=" +
                       std::to_string(other.id));
    EXPECT_EQ(foreign.json["items"].size(), 0u);
}
