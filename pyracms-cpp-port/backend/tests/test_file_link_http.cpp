#include "http_accounts.h"

using namespace harness;

namespace {
std::string mk(const std::string &tok) {
    auto r = upload("/api/files", tok, "v.txt", "secret");
    EXPECT_EQ(r.status, 200) << r.text;
    return r.json["uuid"].asString();
}
} // namespace

TEST(FileLinkHttp, SignedLinkOpensAFileForAnonymousBrowsers) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto f = mk(s.user.token);
    ASSERT_EQ(put("/api/files/" + f + "/visibility",
                  J({{"visibility", "authenticated"}}), s.user.token)
                  .status, 200);
    auto path = "/api/files/" + f;
    EXPECT_EQ(post(path + "/link", J({})).status, 401); // must sign in
    auto l = post(path + "/link", J({}), s.user.token);
    ASSERT_EQ(l.status, 200) << l.text;
    auto q = "?" + l.json["query"].asString();
    auto opened = get(path + q);
    EXPECT_EQ(opened.status, 200);
    EXPECT_EQ(opened.text, "secret");
    EXPECT_EQ(get(path + "/view" + q).status, 200);
    EXPECT_EQ(get(path + "?exp=1&sig=" + l.json["sig"].asString()).status,
              401);
    EXPECT_EQ(get(path + "?exp=" + l.json["exp"].asString() + "&sig=00")
                  .status, 401);
    auto other = makeSite();
    EXPECT_EQ(post(path + "/link", J({}), other.user.token).status, 401);
    EXPECT_EQ(post("/api/files/11111111-2222-4333-8444-555555555555/link",
                   J({}), s.user.token).status, 404);
}
