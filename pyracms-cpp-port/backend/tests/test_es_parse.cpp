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

TEST(EsParse, ParsesMarkedTitleExcerptsTagsAndAuthor) {
    auto reply = parse(R"({"hits":{"total":{"value":1},"hits":[
      {"_score":2,"_source":{"type":"article","ref_id":1,"title":"Golf",
       "url":"/articles/golf","tags":"golf sport  fun","author":"rog",
       "summary":"s"},
       "highlight":{"title":["<G>olf"],"body":["one","two"]}}]}})");
    auto r = esParseSearch(reply, "golf");
    ASSERT_EQ(r.items.size(), 1u);
    EXPECT_EQ(r.items[0].titleMarked, "<G>olf");
    EXPECT_EQ(r.items[0].snippet, "one \xE2\x80\xA6 two");
    EXPECT_EQ(r.items[0].author, "rog");
    EXPECT_EQ(r.items[0].tags,
              (std::vector<std::string>{"golf", "sport", "fun"}));
}

TEST(EsParse, HitsHighlightsFacetsAndSuggestions) {
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
      {"_source":{"title":"A","type":"t","url":"/u"},
       "highlight":{"body":["x"]}}]}})"));
    ASSERT_EQ(a.size(), 1u);
    EXPECT_EQ(a[0].url, "/u");
    EXPECT_EQ(a[0].snippet, "x");
    auto body = parse(esAutocompleteBody(3, "ab", 5));
    EXPECT_EQ(body["size"].asInt(), 5);
    // as-you-type titles OR the same text search as the results page
    auto &should = body["query"]["bool"]["should"];
    EXPECT_EQ(should[0]["match"]["title.autocomplete"]["query"].asString(),
              "ab");
    EXPECT_TRUE(should[1]["bool"]["should"].isArray());
}
