#include "http_accounts.h"

#include <set>

using namespace harness;

namespace {
std::string make(const Site &s, const std::string &tok,
                 std::initializer_list<const char *> tags) {
    auto name = uniq("tg");
    post("/api/articles", J({{"name", name}, {"displayName", name},
                             {"content", "c"}, {"tenant_id", s.id}}), tok);
    put("/api/articles/" + name + "/tags",
        J({{"tags", A(tags)}, {"tenant_id", s.id}}), tok);
    return name;
}

std::set<std::string> listed(const Site &s, const std::string &query,
                             const std::string &token = "") {
    auto r = get("/api/articles?tenant_id=" + std::to_string(s.id) + query,
                 token);
    std::set<std::string> out;
    for (const auto &a : r.json)
        out.insert(a["name"].asString());
    return out;
}
} // namespace

TEST(ArticleTagFilter, ListsOnlyArticlesCarryingTheTag) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto tok = authorToken(s);
    auto a = make(s, tok, {"test", "news"});
    auto b = make(s, tok, {"Test"});
    auto c = make(s, tok, {"other"});
    EXPECT_EQ(listed(s, "&tag=test"), (std::set<std::string>{a, b}));
    EXPECT_EQ(listed(s, "&tag=TEST"), (std::set<std::string>{a, b}));
    EXPECT_EQ(listed(s, "&tag=other"), (std::set<std::string>{c}));
    EXPECT_TRUE(listed(s, "&tag=nothing").empty());
    EXPECT_EQ(listed(s, ""), (std::set<std::string>{a, b, c}));
}

TEST(ArticleTagFilter, KeepsPrivateArticlesOutOfTheTagView) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto tok = authorToken(s);
    auto open = make(s, tok, {"shared"});
    auto hidden = make(s, tok, {"shared"});
    put("/api/articles/" + hidden + "/private",
        J({{"tenant_id", s.id}, {"is_private", true}}), tok);
    EXPECT_EQ(listed(s, "&tag=shared"), (std::set<std::string>{open}));
    EXPECT_EQ(listed(s, "&tag=shared", tok),
              (std::set<std::string>{open, hidden}));
}

TEST(ArticleTagFilter, StaysInsideItsSiteAndRefusesJunk) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    make(s, authorToken(s), {"only-here"});
    EXPECT_TRUE(listed(other, "&tag=only-here").empty());
    auto url = "/api/articles?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(get(url + "&tag=" + std::string(65, 'x')).status, 400);
}
