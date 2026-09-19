#include "http_accounts.h"

using namespace harness;

TEST(PublicReadsHttp, AnalyticsSeoSearchDocs) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto name = uniq("seo");
    post("/api/articles", J({{"name", name}, {"displayName", "Seo"},
         {"content", "hello world zebra"}, {"tenant_id", s.id}}), a);
    post("/api/articles/" + name + "/publish", J({{"tenant_id", s.id}}), a);
    EXPECT_EQ(post("/api/analytics/track", J({{"path", "/x"},
                   {"tenant_id", s.id}, {"referrer", "http://r.test/a"}}))
                  .status, 200);
    EXPECT_EQ(post("/api/analytics/track", J({{"x", 1}})).status, 400);
    for (auto ep : {"page-views", "top-content", "traffic-sources",
                    "search-queries"}) {
        auto p = std::string("/api/analytics/") + ep;
        EXPECT_EQ(get(p + t + "&limit=3&period=7d", a).status, 200) << ep;
        EXPECT_EQ(get(p, a).status, 400) << ep;
    }
    for (auto ep : {"/api/sitemap.xml", "/api/rss.xml", "/api/atom.xml"}) {
        auto r = get(ep + t + "&base_url=http://x.test&title=T");
        EXPECT_EQ(r.status, 200) << ep;
        EXPECT_EQ(get(ep).status, 400) << ep;
    }
    auto seo = "/api/articles/" + name;
    EXPECT_EQ(get(seo + "/jsonld" + t + "&base_url=http://x.test").status,
              200);
    EXPECT_EQ(get(seo + "/opengraph" + t).status, 200);
    EXPECT_EQ(get("/api/articles/none/jsonld" + t).status, 404);
    EXPECT_EQ(get("/api/articles/none/opengraph" + t).status, 404);
    EXPECT_EQ(get("/api/search" + t + "&q=zebra&type=article&limit=5").status,
              200);
    EXPECT_EQ(get("/api/search" + t + "&q=").status, 400);
    EXPECT_EQ(get("/api/search?q=x").status, 400);
    EXPECT_EQ(get("/api/search/autocomplete" + t + "&q=ze&limit=3").status,
              200);
    EXPECT_EQ(get("/api/search/autocomplete?q=x").status, 400);
    EXPECT_EQ(get("/api/docs").status, 200);
    auto spec = get("/api/openapi.yaml").status;
    EXPECT_TRUE(spec == 200 || spec == 404); // spec file ships in prod only
}
