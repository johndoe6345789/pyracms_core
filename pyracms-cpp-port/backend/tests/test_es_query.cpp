#include "services/elasticsearch/EsDocs.h"
#include "services/elasticsearch/EsQuery.h"
#include "services/elasticsearch/EsQueryParts.h"

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
    auto &text = q["must"][0]["bool"];
    EXPECT_EQ(text["should"][0]["multi_match"]["type"].asString(),
              "cross_fields");
    EXPECT_EQ(text["should"][1]["multi_match"]["query"].asString(),
              "hello world");
    // "golf" must not be fuzzed into "gulf" or "gold"
    EXPECT_EQ(text["should"][1]["multi_match"]["fuzziness"].asString(),
              "AUTO:5,10");
    EXPECT_EQ(b["highlight"]["pre_tags"][0].asString(), kEsMarkOpen);
    // the facet counts must not shrink to the chosen type
    EXPECT_EQ(b["post_filter"]["term"]["type"].asString(), "snippet");
    EXPECT_EQ(b["from"].asInt(), 20);
    EXPECT_EQ(b["size"].asInt(), 10);
    EXPECT_FALSE(parse(esSearchBody(7, "x", "all", 1, 0))
                     .isMember("post_filter"));
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
