#include "http_accounts.h"

using namespace harness;

TEST(TenantHttp, CreateListRemoveAndGuards) {
    REQUIRE_SERVER();
    auto pa = platformAdmin();
    auto slug = uniq("tt");
    auto body = J({{"slug", slug}, {"displayName", "T"}, {"description", "d"}});
    EXPECT_EQ(post("/api/tenants", J({{"slug", "x"}}), pa.token).status, 400);
    EXPECT_EQ(post("/api/tenants", body, pa.token).status, 201);
    EXPECT_EQ(post("/api/tenants", body, pa.token).status, 409);
    EXPECT_EQ(post("/api/tenants", body).status, 401);
    auto t = get("/api/tenants/" + slug);
    ASSERT_EQ(t.status, 200);
    EXPECT_EQ(get("/api/tenants/nope-" + slug).status, 404);
    bool found = false;
    for (const auto &x : get("/api/tenants").json)
        found = found || x["slug"].asString() == slug;
    EXPECT_TRUE(found);
    auto site = signup(slug, 3);
    EXPECT_EQ(post("/api/tenants", J({{"slug", uniq("s2")},
                   {"displayName", "n"}}), site.token).status, 403);
    auto id = std::to_string(t.json["id"].asInt());
    EXPECT_EQ(del("/api/tenants/" + id, site.token).status, 403);
    EXPECT_EQ(del("/api/tenants/" + id, pa.token).status, 200);
    EXPECT_EQ(get("/api/tenants/" + slug).status, 404);
}
