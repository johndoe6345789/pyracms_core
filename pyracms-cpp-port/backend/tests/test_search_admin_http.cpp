#include "http_accounts.h"

using namespace harness;

namespace {
std::string statusUrl(const Site &s) {
    return "/api/admin/search?tenant_id=" + std::to_string(s.id);
}
} // namespace

TEST(SearchAdminHttp, StatusCountsWhatShouldBeSearchable) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto tok = authorToken(s);
    auto pub = uniq("pub");
    post("/api/articles", J({{"name", pub}, {"displayName", pub},
                             {"content", "c"}, {"tenant_id", s.id}}), tok);
    post("/api/articles", J({{"name", uniq("draft")}, {"displayName", "d"},
                             {"content", "c"}, {"tenant_id", s.id}}), tok);
    post("/api/articles/" + pub + "/publish", J({{"tenant_id", s.id}}), tok);
    for (const char *vis : {"public", "private"})
        post("/api/snippets", J({{"title", "S"}, {"code", "x"},
                                 {"visibility", vis}, {"tenant_id", s.id}}),
             tok);

    auto r = get(statusUrl(s), s.admin.token);
    ASSERT_EQ(r.status, 200) << r.text;
    EXPECT_EQ(r.json["engine"].asString(), "postgresql");
    EXPECT_FALSE(r.json["configured"].asBool());
    EXPECT_EQ(r.json["source"]["article"].asInt(), 1); // drafts stay out
    EXPECT_EQ(r.json["source"]["snippet"].asInt(), 1); // so do private ones
    EXPECT_EQ(r.json["indexed"].size(), 0u);
}

TEST(SearchAdminHttp, ReindexNeedsACluster) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto url = "/api/admin/search/reindex?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(post(url, J({}), s.admin.token).status, 503);
    EXPECT_EQ(post(url, J({}), "").status, 401);
    EXPECT_EQ(post(url, J({}), signup(s.slug).token).status, 403);
    EXPECT_EQ(get(statusUrl(s), signup(s.slug).token).status, 403);
    EXPECT_EQ(get("/api/admin/search", s.admin.token).status, 400);
}
