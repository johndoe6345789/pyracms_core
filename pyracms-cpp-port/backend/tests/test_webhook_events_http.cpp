#include "http_accounts.h"

#include <set>

using namespace harness;

static const char *kTrack = "http://127.0.0.1:3299/api/analytics/track";

static int subscribe(const Site &s, std::vector<std::string> events) {
    Json::Value ev(Json::arrayValue);
    for (const auto &e : events)
        ev.append(e);
    post("/api/webhooks", J({{"url", kTrack}, {"events", ev},
         {"tenant_id", s.id}}), s.admin.token);
    return maxId("webhooks");
}

static std::set<std::string> delivered(const Site &s, int hook) {
    std::set<std::string> out;
    auto d = get("/api/webhooks/" + std::to_string(hook) +
                 "/deliveries?limit=100", s.admin.token);
    for (const auto &item : d.json)
        out.insert(item["event"].asString());
    return out;
}

TEST(WebhookEvents, ContentEventsReachOnlyTheirOwnTenant) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    const std::vector<std::string> all = {
        "article.created", "article.updated", "article.deleted",
        "article.published", "forum.thread.created", "forum.post.created",
        "comment.created", "user.registered"};
    int mine = subscribe(s, all);
    int theirs = subscribe(other, all);
    auto a = s.admin.token;
    authorToken(s);
    auto name = uniq("wev");
    post("/api/articles", J({{"name", name}, {"displayName", "n"},
         {"content", "secret"}, {"tenant_id", s.id}}), s.user.token);
    put("/api/articles/" + name, J({{"content", "c2"}, {"tenant_id", s.id}}),
        s.user.token);
    post("/api/articles/" + name + "/publish", J({{"tenant_id", s.id}}), a);
    post("/api/comments/article/" + std::to_string(s.id),
         J({{"body", "hi"}}), s.user.token);
    post("/api/forum/categories", J({{"name", "C"}, {"tenantId", s.id}}), a);
    post("/api/forum/forums", J({{"categoryId", maxId("forum_categories")},
         {"name", "F"}}), a);
    post("/api/forum/threads", J({{"forumId", maxId("forums")},
         {"title", "T"}, {"content", "c"}, {"tenantId", s.id}}),
         s.user.token);
    post("/api/forum/posts", J({{"threadId", maxId("forum_threads")},
         {"content", "reply"}}), s.user.token);
    signup(s.slug);
    del("/api/articles/" + name, a, J({{"tenant_id", s.id}}));
    sleep(2);
    auto got = delivered(s, mine);
    for (const auto &e : all)
        EXPECT_TRUE(got.count(e)) << "missing " << e;
    EXPECT_TRUE(delivered(other, theirs).empty());
}
