#include "http_accounts.h"

using namespace harness;

// One tenant holding a searchable item of every type ("quokka").
static Site seedSearchable() {
    auto s = makeSite();
    auto a = s.admin.token;
    auto name = uniq("qk");
    post("/api/articles", J({{"name", name}, {"displayName", "Quokka"},
         {"content", "quokka island"}, {"tenant_id", s.id}}), a);
    post("/api/articles/" + name + "/publish", J({{"tenant_id", s.id}}), a);
    post("/api/forum/categories", J({{"name", "C"}, {"tenantId", s.id}}), a);
    post("/api/forum/forums", J({{"categoryId", maxId("forum_categories")},
         {"name", "F"}}), a);
    post("/api/forum/threads", J({{"forumId", maxId("forums")},
         {"title", "Quokka thread"}, {"content", "quokka post"},
         {"tenantId", s.id}}), s.user.token);
    post("/api/snippets", J({{"title", "Quokka snippet"},
         {"code", "print('quokka')"}, {"tenant_id", s.id}}), s.user.token);
    post("/api/gamedep/game", J({{"name", uniq("quokka")},
         {"displayName", "Quokka game"}, {"description", "quokka"}}), a);
    return s;
}

TEST(SearchHttp, EveryTypeFacetsAndAutocomplete) {
    REQUIRE_SERVER();
    auto s = seedSearchable();
    auto t = "&tenant_id=" + std::to_string(s.id);
    auto all = get("/api/search?q=quokka" + t);
    ASSERT_EQ(all.status, 200);
    EXPECT_GE(all.json["totalCount"].asInt(), 3);
    EXPECT_GE(all.json["items"].size(), 3u);
    for (auto type : {"article", "forum_post", "snippet", "gamedep", "all",
                      "unknown"}) {
        auto r = get(std::string("/api/search?q=quokka&type=") + type + t);
        EXPECT_EQ(r.status, 200) << type;
    }
    EXPECT_EQ(get("/api/search?q=%20%20" + t).json["totalCount"].asInt(), 0);
    EXPECT_EQ(get("/api/search?q=quokka&limit=1&offset=1" + t).status, 200);
    auto ac = get("/api/search/autocomplete?q=quo&limit=10" + t);
    ASSERT_EQ(ac.status, 200);
    EXPECT_GE(ac.json.size(), 1u);
    EXPECT_EQ(get("/api/search/autocomplete?limit=10" + t).status, 400);
    // The tenant filter keeps other sites' content out.
    auto other = makeSite();
    auto foreign = get("/api/search?q=quokka&tenant_id=" +
                       std::to_string(other.id));
    EXPECT_EQ(foreign.json["totalCount"].asInt(), 0);
}
