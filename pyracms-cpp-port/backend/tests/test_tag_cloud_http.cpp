#include "http_accounts.h"

#include <map>

using namespace harness;

namespace {
std::string makeSnippet(const Site &s, const char *visibility) {
    auto c = post("/api/snippets",
                  J({{"title", "S"}, {"code", "print(1)"},
                     {"visibility", visibility}, {"tenant_id", s.id}}),
                  s.user.token);
    return std::to_string(c.json["id"].asInt());
}

std::string makeArticle(const Site &s, const std::string &tok,
                        bool publish) {
    auto name = uniq("tg");
    post("/api/articles", J({{"name", name}, {"displayName", name},
                             {"content", "c"}, {"tenant_id", s.id}}),
         tok);
    post("/api/articles/" + name + (publish ? "/publish" : "/unpublish"),
         J({{"tenant_id", s.id}}), tok);
    return name;
}

Json::Value arr(std::initializer_list<std::string> items) {
    Json::Value out(Json::arrayValue);
    for (const auto &i : items)
        out.append(i);
    return out;
}
} // namespace

TEST(TagCloudHttp, CountsPublicPublishedContentOnly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto pub = makeSnippet(s, "public");
    auto priv = makeSnippet(s, "private");
    auto tok = authorToken(s);
    auto art = makeArticle(s, tok, true);
    auto draft = makeArticle(s, tok, false);
    for (auto id : {pub, priv})
        put("/api/snippets/" + id + "/tags",
            J({{"tags", arr({"shared", "only-" + id})}}), s.user.token);
    for (auto n : {art, draft})
        put("/api/articles/" + n + "/tags",
            J({{"tags", arr({"Shared", "  ", "art-" + n})},
               {"tenant_id", s.id}}),
            tok);

    auto cloud = get("/api/tags/cloud?tenant_id=" + std::to_string(s.id));
    ASSERT_EQ(cloud.status, 200) << cloud.text;
    std::map<std::string, Json::Value> by;
    for (const auto &t : cloud.json)
        by[t["name"].asString()] = t;
    ASSERT_TRUE(by.count("shared"));
    EXPECT_EQ(by["shared"]["articles"].asInt(), 1); // the draft is not counted
    EXPECT_EQ(by["shared"]["snippets"].asInt(), 1); // nor the private snippet
    EXPECT_EQ(by["shared"]["count"].asInt(), 2);
    EXPECT_TRUE(by.count("only-" + pub));
    EXPECT_FALSE(by.count("only-" + priv));
    EXPECT_TRUE(by.count("art-" + art));
    EXPECT_FALSE(by.count("art-" + draft));
    EXPECT_FALSE(by.count("")); // blank tags never appear
    EXPECT_EQ(get("/api/tags/cloud").status, 400);
}
