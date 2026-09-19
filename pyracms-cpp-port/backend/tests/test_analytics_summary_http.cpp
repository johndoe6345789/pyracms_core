#include "http_accounts.h"

using namespace harness;

static void track(int tenant, const std::string &path, int n = 1) {
    for (int i = 0; i < n; i++)
        post("/api/analytics/track",
             J({{"path", path}, {"tenant_id", tenant}}));
}

TEST(AnalyticsSummary, CountsAndTopPagesForAdminsOnly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    track(s.id, "/hot", 3);
    track(s.id, "/cold");
    testDb()->execSqlSync("INSERT INTO page_views (tenant_id, path, "
                          "created_at) VALUES ($1, '/old', NOW() - "
                          "INTERVAL '20 days')", s.id);
    auto q = "/api/analytics/summary?tenant_id=" + std::to_string(s.id);
    auto r = get(q, s.admin.token);
    ASSERT_EQ(r.status, 200);
    EXPECT_EQ(r.json["views7d"].asInt(), 4);
    EXPECT_EQ(r.json["views30d"].asInt(), 5);
    EXPECT_EQ(r.json["topPages"][0]["path"].asString(), "/hot");
    EXPECT_EQ(r.json["topPages"][0]["views"].asInt(), 3);
    EXPECT_EQ(get(q).status, 401);
    EXPECT_EQ(get(q, s.user.token).status, 403);
    EXPECT_EQ(get("/api/analytics/summary", s.admin.token).status, 400);
    auto other = makeSite();
    EXPECT_EQ(get("/api/analytics/summary?tenant_id=" +
                  std::to_string(other.id), s.admin.token).status, 403);
    EXPECT_EQ(get("/api/analytics/summary?tenant_id=" +
                  std::to_string(other.id), other.admin.token)
                  .json["views7d"].asInt(), 0);
}

TEST(AnalyticsSummary, TrackValidatesPathAndTenant) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto t = [&](Json::Value path, int tenant) {
        return post("/api/analytics/track",
                    J({{"path", path}, {"tenant_id", tenant}})).status;
    };
    EXPECT_EQ(t("/ok?x=1", s.id), 200);
    EXPECT_EQ(t("no-slash", s.id), 400);
    EXPECT_EQ(t("", s.id), 400);
    EXPECT_EQ(t("/bad\nline", s.id), 400);
    EXPECT_EQ(t("/x", 0), 400);
    EXPECT_EQ(t("/x", -3), 400);
    EXPECT_EQ(t("/x", 999999999), 400);
}
