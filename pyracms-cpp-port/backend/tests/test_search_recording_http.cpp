#include "http_accounts.h"

using namespace harness;

namespace {
std::string base(const Site &s) {
    return "/api/search?tenant_id=" + std::to_string(s.id);
}

// Recording is fire-and-forget, so give it a moment to land.
Json::Value popular(const Site &s, size_t want) {
    Json::Value out;
    for (int i = 0; i < 20; ++i) {
        out = get("/api/analytics/search-queries?tenant_id=" +
                      std::to_string(s.id),
                  s.admin.token).json;
        if (out.size() >= want)
            break;
        usleep(100000);
    }
    return out;
}
} // namespace

TEST(SearchRecording, CountsFreshSearchesCaseInsensitively) {
    REQUIRE_SERVER();
    auto s = makeSite();
    EXPECT_EQ(get(base(s) + "&q=React").status, 200);
    EXPECT_EQ(get(base(s) + "&q=REACT").status, 200);
    EXPECT_EQ(get(base(s) + "&q=vue").status, 200);
    auto out = popular(s, 2);
    ASSERT_EQ(out.size(), 2u);
    EXPECT_EQ(out[0]["query"].asString(), "react");
    EXPECT_EQ(out[0]["count"].asInt(), 2);
    EXPECT_EQ(out[1]["query"].asString(), "vue");
}

TEST(SearchRecording, IgnoresPagingFacetsAndTinyQueries) {
    REQUIRE_SERVER();
    auto s = makeSite();
    get(base(s) + "&q=kept");
    get(base(s) + "&q=paged&offset=20");
    get(base(s) + "&q=faceted&type=article");
    get(base(s) + "&q=x");
    auto out = popular(s, 1);
    usleep(500000); // long enough for a wrongly recorded one to appear
    out = popular(s, 1);
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0]["query"].asString(), "kept");
}

TEST(SearchRecording, StaysInsideItsSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    get(base(s) + "&q=secret-term");
    popular(s, 1);
    auto theirs = get("/api/analytics/search-queries?tenant_id=" +
                          std::to_string(other.id),
                      other.admin.token).json;
    EXPECT_EQ(theirs.size(), 0u);
}
