#include "http_accounts.h"

using namespace harness;

namespace {
std::string mk(const std::string &tok) {
    auto r = upload("/api/files", tok, "v.txt", "secret");
    EXPECT_EQ(r.status, 200) << r.text;
    return r.json["uuid"].asString();
}
std::string vis(const std::string &uuid, const std::string &v,
                const std::string &tok, int *status = nullptr) {
    auto r = put("/api/files/" + uuid + "/visibility",
                 J({{"visibility", v}}), tok);
    if (status)
        *status = r.status;
    return r.text;
}
} // namespace

TEST(FileVisibilityHttp, AuthenticatedOnlyNeedsASignedInViewer) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto f = mk(s.user.token);
    auto path = "/api/files/" + f;
    EXPECT_EQ(get(path).status, 200); // public by default

    int st = 0;
    vis(f, "authenticated", s.user.token, &st);
    ASSERT_EQ(st, 200);
    EXPECT_EQ(get(path).status, 401);                   // anonymous
    EXPECT_EQ(get(path + "/view").status, 401);
    EXPECT_EQ(get(path + "/thumbnail").status, 401);
    EXPECT_EQ(get(path, s.user.token).status, 200);     // signed in
    EXPECT_EQ(get(path, s.admin.token).status, 200);
    EXPECT_EQ(get(path, other.user.token).status, 401); // another site

    vis(f, "public", s.user.token, &st);
    ASSERT_EQ(st, 200);
    EXPECT_EQ(get(path).status, 200);
}

TEST(FileVisibilityHttp, ListedAndGuarded) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto f = mk(s.user.token);
    int st = 0;
    vis(f, "everyone", s.user.token, &st);
    EXPECT_EQ(st, 400);
    EXPECT_EQ(put("/api/files/" + f + "/visibility", J({{"x", 1}}),
                  s.user.token).status, 400);
    EXPECT_EQ(put("/api/files/" + f + "/visibility",
                  J({{"visibility", "public"}})).status, 401);
    auto other = makeSite();
    vis(f, "public", other.user.token, &st); // not the uploader, not an admin
    EXPECT_EQ(st, 403);
    vis("11111111-2222-4333-8444-555555555555", "public", s.admin.token,
        &st);
    EXPECT_EQ(st, 404);
    vis(f, "authenticated", s.admin.token, &st); // admins may
    ASSERT_EQ(st, 200);
    auto t = "&tenant_id=" + std::to_string(s.id);
    auto all = get("/api/files?x=1" + t, s.admin.token);
    ASSERT_EQ(all.status, 200) << all.text;
    bool seen = false;
    for (const auto &row : all.json)
        if (row["uuid"].asString() == f) {
            seen = true;
            EXPECT_EQ(row["visibility"].asString(), "authenticated");
        }
    EXPECT_TRUE(seen);
}
