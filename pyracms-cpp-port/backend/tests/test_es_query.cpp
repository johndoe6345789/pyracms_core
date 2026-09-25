#include "services/elasticsearch/EsDocs.h"
#include "services/elasticsearch/EsQuery.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
Json::Value parse(const std::string &s) {
    Json::Value v;
    Json::CharReaderBuilder b;
    std::istringstream in(s);
    std::string err;
    EXPECT_TRUE(Json::parseFromStream(b, in, &v, &err)) << err;
    return v;
}
} // namespace

TEST(EsQuery, SearchIsScopedToTheSiteAndTypeOnlyFiltersHits) {
    auto b = parse(esSearchBody(7, "hello world", "snippet", 10, 20));
    auto &q = b["query"]["bool"];
    EXPECT_EQ(q["filter"][0]["term"]["tenant_id"].asInt(), 7);
    EXPECT_EQ(q["must"][0]["multi_match"]["query"].asString(), "hello world");
    // the facet counts must not shrink to the chosen type
    EXPECT_EQ(b["post_filter"]["term"]["type"].asString(), "snippet");
    EXPECT_EQ(b["from"].asInt(), 20);
    EXPECT_EQ(b["size"].asInt(), 10);
    EXPECT_FALSE(parse(esSearchBody(7, "x", "all", 1, 0))
                     .isMember("post_filter"));
}

TEST(EsQuery, ParsesHitsHighlightsAndFacets) {
    auto reply = parse(R"({"hits":{"total":{"value":2},"hits":[
      {"_score":1.5,"_source":{"type":"article","ref_id":4,"title":"T",
       "url":"/articles/t","summary":"sum","created_at":"2020-01-01"},
       "highlight":{"body":["the match"]}},
      {"_score":0.5,"_source":{"type":"snippet","ref_id":9,"title":"S",
       "url":"/snippets/9","summary":"fallback"}}]},
      "aggregations":{"types":{"buckets":[
       {"key":"article","doc_count":1},{"key":"snippet","doc_count":1}]}}})");
    auto r = esParseSearch(reply, "q");
    EXPECT_EQ(r.totalCount, 2);
    ASSERT_EQ(r.items.size(), 2u);
    EXPECT_EQ(r.items[0].snippet, "the match");
    EXPECT_EQ(r.items[1].snippet, "fallback");
    EXPECT_EQ(r.items[1].id, 9);
    EXPECT_EQ(r.facets["article"], 1);
    auto a = esParseAutocomplete(parse(R"({"hits":{"hits":[
      {"_source":{"title":"A","type":"t","url":"/u"}}]}})"));
    ASSERT_EQ(a.size(), 1u);
    EXPECT_EQ(a[0].url, "/u");
    EXPECT_EQ(parse(esAutocompleteBody(3, "ab", 5))["size"].asInt(), 5);
}

TEST(EsDocs, DatesDeleteLinesAndBulkFailures) {
    EXPECT_EQ(esIsoDate("2026-09-19 01:57:16.4+00"),
              "2026-09-19T01:57:16.4+00:00");
    EXPECT_EQ(esDeleteLine("article:3"),
              "{\"delete\":{\"_id\":\"article:3\","
              "\"_index\":\"pyracms_content\"}}\n");
    EXPECT_FALSE(
        esBulkFailed(parse(R"({"items":[{"index":{"status":201}}]})")));
    EXPECT_TRUE(esBulkFailed(
        parse(R"({"items":[{"index":{"error":{"type":"x"}}}]})")));
    EXPECT_TRUE(esBulkFailed(Json::Value())); // no reply at all
}
