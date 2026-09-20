#include "http_accounts.h"
#include "services/ArticleService.h"

#include <future>
#include <unistd.h>

using namespace harness;

static const char *kHook = "http://127.0.0.1:3299/api/analytics/track";

static int hookFor(const Site &s) {
    post("/api/webhooks", J({{"url", kHook}, {"events",
         A({"article.published"})}, {"tenant_id", s.id}}), s.admin.token);
    return maxId("webhooks");
}

static int deliveries(const Site &s, int hook) {
    auto d = get("/api/webhooks/" + std::to_string(hook) +
                 "/deliveries?limit=100", s.admin.token);
    return static_cast<int>(d.json.size());
}

TEST(PublishDue, ScheduledPublishFiresWebhookForItsSiteOnly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    int mine = hookFor(s), theirs = hookFor(other);
    authorToken(s);
    post("/api/articles", J({{"name", "due-a"}, {"displayName", "d"},
         {"content", "x"}, {"tenant_id", s.id}}), s.user.token);
    auto when = J({{"tenant_id", s.id}, {"scheduled_at", "2099-01-01 00:00"}});
    EXPECT_EQ(post("/api/articles/due-a/schedule", when,
                   s.user.token).status, 200);
    EXPECT_EQ(post("/api/articles/due-a/schedule",
                   J({{"tenant_id", s.id}, {"scheduled_at", "soon"}}),
                   s.user.token).status, 400);
    testDb()->execSqlSync("UPDATE articles SET scheduled_at = NOW() - "
                          "INTERVAL '1 minute' WHERE name = 'due-a' AND "
                          "tenant_id = $1", s.id);
    std::promise<std::string> done;
    pyracms::ArticleService().publishDueArticles(
        drogon::app().getDbClient(),
        [&done](bool, const std::string &msg) { done.set_value(msg); });
    EXPECT_EQ(done.get_future().get(), "1 articles published");
    sleep(2);
    EXPECT_EQ(deliveries(s, mine), 1);
    EXPECT_EQ(deliveries(other, theirs), 0);
    auto art = get("/api/articles/due-a?tenant_id=" + std::to_string(s.id));
    EXPECT_EQ(art.status, 200);
}
