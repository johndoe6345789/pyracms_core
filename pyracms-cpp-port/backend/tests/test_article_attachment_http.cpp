#include "http_accounts.h"

using namespace harness;

namespace {
std::string makeArticle(const Site &s, const std::string &tok) {
    auto name = uniq("att");
    post("/api/articles", J({{"name", name}, {"displayName", name},
                             {"content", "c"}, {"tenant_id", s.id}}),
         tok);
    return name;
}
std::string base(const std::string &n) {
    return "/api/articles/" + n + "/attachments";
}
} // namespace

TEST(ArticleAttachmentHttp, AddListRemove) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto tok = authorToken(s);
    auto name = makeArticle(s, tok);
    auto file = upload("/api/files", tok, "data.txt", "hello")
                    .json["uuid"].asString();

    auto add = post(base(name), J({{"fileUuid", file}, {"tenant_id", s.id}}),
                    tok);
    ASSERT_EQ(add.status, 201) << add.text;
    EXPECT_EQ(post(base(name), J({{"fileUuid", file}, {"tenant_id", s.id}}),
                   tok).status, 404);

    auto list = get(base(name) + t, tok);
    ASSERT_EQ(list.status, 200) << list.text;
    ASSERT_EQ(list.json.size(), 1u);
    EXPECT_EQ(list.json[0]["fileUuid"].asString(), file);
    EXPECT_EQ(list.json[0]["filename"].asString(), "data.txt");
    EXPECT_EQ(list.json[0]["size"].asInt(), 5);

    auto id = std::to_string(list.json[0]["id"].asInt());
    EXPECT_EQ(del(base(name) + "/" + id + t, tok).status, 200);
    EXPECT_EQ(get(base(name) + t, tok).json.size(), 0u);
    EXPECT_EQ(del(base(name) + "/" + id + t, tok).status, 404);
}

TEST(ArticleAttachmentHttp, OwnerOnlyAndFollowsArticleVisibility) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto tok = authorToken(s);
    auto name = makeArticle(s, tok);
    auto file = upload("/api/files", tok, "a.txt", "x")
                    .json["uuid"].asString();
    auto body = J({{"fileUuid", file}, {"tenant_id", s.id}});

    EXPECT_EQ(post(base(name), body, "").status, 401);
    EXPECT_EQ(post(base(name), J({{"tenant_id", s.id}}), tok).status,
              400);
    EXPECT_EQ(post(base(name), J({{"fileUuid", "nope"}, {"tenant_id", s.id}}),
                   tok).status, 400);
    EXPECT_EQ(get(base(name)).status, 400); // tenant_id required
    auto other = signup(s.slug);
    EXPECT_EQ(post(base(name), body, other.token).status, 403);

    ASSERT_EQ(post(base(name), body, tok).status, 201);
    auto id = std::to_string(
        get(base(name) + t, tok).json[0]["id"].asInt());
    EXPECT_EQ(del(base(name) + "/" + id + t, other.token).status, 403);
    EXPECT_EQ(del(base(name) + "/x" + t, tok).status, 400);

    // a draft is invisible to strangers, so are its downloads
    ASSERT_EQ(post("/api/articles/" + name + "/unpublish",
                   J({{"tenant_id", s.id}}), tok).status, 200);
    EXPECT_EQ(get(base(name) + t).status, 404);
    ASSERT_EQ(post("/api/articles/" + name + "/publish",
                   J({{"tenant_id", s.id}}), tok).status, 200);
    auto pub = get(base(name) + t);
    ASSERT_EQ(pub.status, 200) << pub.text;
    EXPECT_EQ(pub.json.size(), 1u);
}
