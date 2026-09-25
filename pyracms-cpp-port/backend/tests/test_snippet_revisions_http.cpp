#include "http_accounts.h"

using namespace harness;

namespace {
std::string path(const std::string &id, const std::string &rest = "") {
    return "/api/snippets/" + id + rest;
}
Json::Value body(const Site &s, const std::string &code,
                 const std::string &summary = "") {
    return J({{"title", "S"}, {"code", code}, {"language", "python"},
              {"summary", summary}, {"tenant_id", s.id}});
}
} // namespace

TEST(SnippetRevisionsHttp, CreateUpdateListViewRevert) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto id = std::to_string(
        post("/api/snippets", body(s, "v1"), u).json["id"].asInt());

    auto first = get(path(id, "/revisions") + t);
    ASSERT_EQ(first.status, 200);
    ASSERT_EQ(first.json.size(), 1u);
    EXPECT_EQ(first.json[0]["revisionNumber"].asInt(), 1);
    EXPECT_EQ(first.json[0]["summary"].asString(), "Initial revision");

    ASSERT_EQ(put(path(id), body(s, "v2", "second"), u).status, 200);
    EXPECT_EQ(put(path(id), body(s, "v2", "no change"), u).status, 200);
    auto list = get(path(id, "/revisions") + t);
    ASSERT_EQ(list.json.size(), 2u); // the no-op save added nothing
    EXPECT_EQ(list.json[0]["revisionNumber"].asInt(), 2); // newest first
    EXPECT_EQ(list.json[0]["code"].asString(), "v2");
    EXPECT_EQ(list.json[0]["summary"].asString(), "second");
    EXPECT_EQ(list.json[0]["authorUsername"].asString(), s.user.name);

    EXPECT_EQ(get(path(id, "/revisions/1") + t).json["code"].asString(),
              "v1");
    EXPECT_EQ(get(path(id, "/revisions/9") + t).status, 404);

    ASSERT_EQ(post(path(id, "/revert/1"), J({{"x", 1}}), u).status, 200);
    EXPECT_EQ(get(path(id) + t).json["code"].asString(), "v1");
    auto after = get(path(id, "/revisions") + t);
    ASSERT_EQ(after.json.size(), 3u); // history is added to, not rewritten
    EXPECT_EQ(after.json[0]["summary"].asString(), "Reverted to revision 1");
}

TEST(SnippetRevisionsHttp, OnlyTheAuthorRevertsAndPrivateStaysPrivate) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    auto t = "?tenant_id=" + std::to_string(s.id);
    auto id = std::to_string(
        post("/api/snippets", body(s, "v1"), u).json["id"].asInt());
    put(path(id), body(s, "v2"), u);
    auto other = signup(s.slug);
    EXPECT_EQ(post(path(id, "/revert/1"), J({{"x", 1}}), other.token).status,
              404);
    EXPECT_EQ(post(path(id, "/revert/1"), J({{"x", 1}}), "").status, 401);
    EXPECT_EQ(get(path(id) + t).json["code"].asString(), "v2");

    auto priv = J({{"title", "S"}, {"code", "x"}, {"visibility", "private"},
                   {"tenant_id", s.id}});
    auto pid =
        std::to_string(post("/api/snippets", priv, u).json["id"].asInt());
    EXPECT_EQ(get(path(pid, "/revisions") + t).status, 404);
    EXPECT_EQ(get(path(pid, "/revisions") + t, other.token).status, 404);
    EXPECT_EQ(get(path(pid, "/revisions") + t, u).status, 200);
    auto fork = post(path(id, "/fork"), J({{"tenant_id", s.id}}), other.token);
    ASSERT_EQ(fork.status, 201);
    auto fid = std::to_string(fork.json["id"].asInt());
    auto fh = get(path(fid, "/revisions") + t);
    ASSERT_EQ(fh.json.size(), 1u); // a fork starts with its own history
    EXPECT_EQ(fh.json[0]["summary"].asString(), "Forked from snippet " + id);
}
