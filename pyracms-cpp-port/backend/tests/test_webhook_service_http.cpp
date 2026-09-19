#include "http_accounts.h"
#include "services/AnalyticsService.h"
#include "services/WebhookService.h"

using namespace harness;
using namespace pyracms;

static int hook(const Site &s, const std::string &url,
                const std::string &secret) {
    post("/api/webhooks", J({{"url", url}, {"events", A({"ping"})},
         {"tenant_id", s.id}, {"secret", secret}}), s.admin.token);
    return maxId("webhooks");
}

TEST(WebhookService, DeliversSignedEventsAndRetriesFailures) {
    REQUIRE_SERVER();
    auto s = makeSite();
    int good = hook(s, "http://127.0.0.1:3299/api/analytics/track", "sec");
    int plain = hook(s, "http://127.0.0.1:3299/api/analytics/track", "");
    int bad = hook(s, "http://127.0.0.1:9/nothing", "");
    WebhookService svc;
    Json::Value data;
    data["path"] = "/x";
    data["tenant_id"] = s.id;
    svc.fireEvent(testDb(), s.id, "ping", data);
    svc.fireEvent(testDb(), s.id, "other-event", data);
    sleep(3); // first attempt plus the 1s and 2s retries of the bad hook
    for (int id : {good, plain}) {
        auto d = get("/api/webhooks/" + std::to_string(id) + "/deliveries",
                     s.admin.token);
        ASSERT_EQ(d.status, 200);
        ASSERT_GE(d.json.size(), 1u);
        // track rejects the envelope (no top-level path): proves it arrived
        EXPECT_EQ(d.json[0]["statusCode"].asInt(), 400);
    }
    auto b = get("/api/webhooks/" + std::to_string(bad) + "/deliveries",
                 s.admin.token);
    EXPECT_GE(b.json.size(), 2u);
    EXPECT_EQ(b.json[0]["statusCode"].asInt(), 0);
}

TEST(AnalyticsService, SearchQueriesAndPeriods) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto db = testDb();
    AnalyticsService svc;
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.recordSearchQuery(db, s.id, "zebra", 3, s.user.id,
                                          cb);
                }).first);
    EXPECT_TRUE(awaitBool([&](auto cb) {
                    svc.recordSearchQuery(db, s.id, "zebra", 1, 0, cb);
                }).first);
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto q = get("/api/analytics/search-queries" + t, s.admin.token);
    ASSERT_EQ(q.status, 200);
    EXPECT_EQ(q.json[0]["query"].asString(), "zebra");
    for (auto p : {"week", "month", "day"})
        EXPECT_EQ(get("/api/analytics/page-views" + t + "&period=" + p,
                      s.admin.token).status, 200);
}
