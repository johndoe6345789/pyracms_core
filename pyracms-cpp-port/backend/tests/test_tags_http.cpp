#include "http_accounts.h"

#include <set>

using namespace harness;

namespace {
std::string makeSnippet(const Site &s, const char *visibility) {
    auto c = post("/api/snippets",
                  J({{"title", "S"}, {"code", "print(1)"},
                     {"visibility", visibility}, {"tenant_id", s.id}}),
                  s.user.token);
    return std::to_string(c.json["id"].asInt());
}

std::set<std::string> names(const Json::Value &v) {
    std::set<std::string> out;
    for (const auto &t : v)
        out.insert(t.asString());
    return out;
}

} // namespace

TEST(TagsHttp, SnippetTagsAreNormalisedListedAndFiltered) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = makeSnippet(s, "public");
    auto other = makeSnippet(s, "public");
    auto set = put("/api/snippets/" + id + "/tags",
                   J({{"tags", A({" Strings ", "strings", "File IO", ""})}}),
                   s.user.token);
    ASSERT_EQ(set.status, 200) << set.text;
    EXPECT_EQ(names(set.json["tags"]),
              (std::set<std::string>{"strings", "file-io"}));
    // keeping one, adding one
    ASSERT_EQ(put("/api/snippets/" + id + "/tags",
                  J({{"tags", A({"strings", "math"})}}), s.user.token).status,
              200);
    auto t = "&tenant_id=" + std::to_string(s.id);
    auto got = get("/api/snippets/" + id + "?" + t.substr(1));
    EXPECT_EQ(names(got.json["tags"]),
              (std::set<std::string>{"strings", "math"}));

    auto tagged = get("/api/snippets?tag=MATH" + t);
    ASSERT_EQ(tagged.status, 200);
    ASSERT_EQ(tagged.json["items"].size(), 1u);
    EXPECT_EQ(std::to_string(tagged.json["items"][0]["id"].asInt()), id);
    EXPECT_EQ(get("/api/snippets?" + t.substr(1)).json["total"].asInt(), 2);
    EXPECT_EQ(get("/api/snippets?tag=nope" + t).json["total"].asInt(), 0);
    (void)other;

    ASSERT_EQ(put("/api/snippets/" + id + "/tags", J({{"tags", A({})}}),
                  s.user.token).status, 200);
    EXPECT_EQ(get("/api/snippets/" + id + "?" + t.substr(1))
                  .json["tags"].size(), 0u);
}

TEST(TagsHttp, OnlyTheAuthorTagsAndInputIsChecked) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = makeSnippet(s, "public");
    auto body = J({{"tags", A({"x"})}});
    EXPECT_EQ(put("/api/snippets/" + id + "/tags", body, "").status, 401);
    EXPECT_EQ(put("/api/snippets/" + id + "/tags", body,
                  signup(s.slug).token).status, 404);
    EXPECT_EQ(put("/api/snippets/" + id + "/tags", J({{"x", 1}}),
                  s.user.token).status, 400);
    Json::Value numbers(Json::arrayValue);
    numbers.append(1);
    EXPECT_EQ(put("/api/snippets/" + id + "/tags", J({{"tags", numbers}}),
                  s.user.token).status, 400);
    EXPECT_EQ(put("/api/snippets/99999999/tags", body, s.user.token).status,
              404);
}
