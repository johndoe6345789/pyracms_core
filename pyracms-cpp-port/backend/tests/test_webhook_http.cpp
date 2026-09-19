#include "http_accounts.h"

using namespace harness;

TEST(WebhookHttp, CrudAndDeliveries) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(post("/api/webhooks", J({{"url", "x"}}), a).status, 400);
    auto self = "http://127.0.0.1:3299/api/analytics/track";
    auto c = post("/api/webhooks",
                  J({{"url", self}, {"events", A({"article.published"})},
                     {"tenant_id", s.id}, {"secret", "s"}}), a);
    ASSERT_TRUE(ok(c)) << c.text;
    auto id = std::to_string(maxId("webhooks"));
    EXPECT_EQ(get("/api/webhooks" + t, a).status, 200);
    EXPECT_EQ(get("/api/webhooks", a).status, 400);
    EXPECT_EQ(put("/api/webhooks/" + id,
                  J({{"url", self}, {"active", true},
                     {"events", A({"article.published", "x"})}}), a).status,
              200);
    EXPECT_EQ(get("/api/webhooks/" + id + "/deliveries?limit=5&offset=0", a)
                  .status, 200);
    EXPECT_EQ(get("/api/webhooks/" + id + "/deliveries", a).status, 200);
    // Publishing an article fires the webhook over real HTTP.
    auto name = uniq("wh");
    post("/api/articles", J({{"name", name}, {"displayName", "n"},
         {"content", "c"}, {"tenant_id", s.id}}), a);
    post("/api/articles/" + name + "/publish", J({{"tenant_id", s.id}}), a);
    usleep(500000);
    EXPECT_EQ(del("/api/webhooks/" + id, a).status, 200);
    EXPECT_NE(del("/api/webhooks/" + id, a).status, 200);
}
