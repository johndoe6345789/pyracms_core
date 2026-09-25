#include "http_accounts.h"

#include <set>

using namespace harness;

namespace {
std::string mkFile(const std::string &tok) {
    return upload("/api/files", tok, "f.txt", "hello").json["uuid"]
        .asString();
}
std::string url(const Site &s, const std::string &extra = "") {
    return "/api/files/folders?tenant_id=" + std::to_string(s.id) + extra;
}
std::set<std::string> names(const Json::Value &v) {
    std::set<std::string> out;
    for (const auto &x : v)
        out.insert(x.asString());
    return out;
}
} // namespace

TEST(FileFoldersHttp, CreateListMoveFilterRemove) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    EXPECT_EQ(post(url(s), J({{"path", " pics / 2024 "}}), a).status, 200);
    EXPECT_EQ(post(url(s), J({{"path", "docs"}}), a).status, 200);
    EXPECT_EQ(names(get(url(s), a).json),
              (std::set<std::string>{"pics/2024", "docs"}));
    auto f = mkFile(a);
    ASSERT_EQ(put("/api/files/" + f + "/folder", J({{"folder", "docs"}}), a)
                  .status, 200);
    auto t = "&tenant_id=" + std::to_string(s.id);
    auto in = get("/api/files?folder=docs" + t, a);
    ASSERT_EQ(in.json.size(), 1u);
    EXPECT_EQ(in.json[0]["folder"].asString(), "docs");
    EXPECT_EQ(get("/api/files?folder=" + t, a).json.size(), 0u); // the top
    EXPECT_EQ(get("/api/files?x=1" + t, a).json.size(), 1u);     // all
    EXPECT_EQ(del(url(s, "&path=docs"), a).status, 409);         // has a file
    ASSERT_EQ(put("/api/files/" + f + "/folder", J({{"folder", ""}}), a)
                  .status, 200);
    EXPECT_EQ(del(url(s, "&path=docs"), a).status, 200);
    EXPECT_EQ(del(url(s, "&path=docs"), a).status, 404);
    EXPECT_EQ(del(url(s, "&path=pics"), a).status, 409); // has a subfolder
    EXPECT_EQ(del(url(s, "&path=pics/2024"), a).status, 200);
}

TEST(FileFoldersHttp, ValidatedAndAdminOnly) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    EXPECT_EQ(post(url(s), J({{"path", "../x"}}), a).status, 400);
    EXPECT_EQ(post(url(s), J({{"path", ""}}), a).status, 400);
    EXPECT_EQ(post(url(s), J({{"path", "x"}}), s.user.token).status, 403);
    EXPECT_EQ(post(url(s), J({{"path", "x"}}), "").status, 401);
    EXPECT_EQ(get("/api/files/folders", a).status, 400);
    auto f = mkFile(s.user.token);
    EXPECT_EQ(put("/api/files/" + f + "/folder", J({{"folder", "a/../b"}}),
                  s.user.token).status, 400);
    EXPECT_EQ(put("/api/files/" + f + "/folder", J({{"folder", "mine"}}),
                  signup(s.slug).token).status, 403);
    EXPECT_EQ(get("/api/files?folder=..&tenant_id=" + std::to_string(s.id), a)
                  .status, 400);
}
