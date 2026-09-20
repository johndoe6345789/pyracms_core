#include "owner_scope_support.h"

#include <set>
#include "port.h"

using namespace harness;

static std::set<std::string> actions(const Reply &r) {
    std::set<std::string> out;
    for (const auto &i : r.json)
        out.insert(i["action"].asString());
    return out;
}

TEST(Audit, AdminActionsAreRecordedPerSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = s.admin.token;
    auto other = makeSite();
    auto victim = signup(s.slug, 1);
    auto gone = signup(s.slug, 1);
    post("/api/forum/categories", J({{"name", "AuditCat"},
         {"tenantId", s.id}}), a);
    int cid = maxId("forum_categories");
    post("/api/forum/forums", J({{"categoryId", cid}, {"name", "AF"}}), a);
    int fid = maxId("forums");
    put("/api/users/" + std::to_string(victim.id) + "/ban",
        J({{"banned", true}}), a);
    put("/api/users/" + std::to_string(gone.id) + "/role",
        J({{"role", 2}}), a);
    put("/api/settings/site_name", J({{"tenantId", s.id},
        {"value", "v"}}), a);
    del("/api/forum/forums/" + std::to_string(fid), a);
    del("/api/forum/categories/" + std::to_string(cid), a);
    del("/api/users/" + std::to_string(gone.id), a);
    sleep(1);
    auto r = get("/api/audit?tenant_id=" + std::to_string(s.id), a);
    ASSERT_EQ(r.status, 200);
    auto got = actions(r);
    for (const char *x : {"category.create", "forum.create", "user.ban",
                          "user.role", "settings.write", "forum.delete",
                          "category.delete", "user.delete"})
        EXPECT_TRUE(got.count(x)) << x;
    EXPECT_EQ(r.json[0]["actor"].asString(), s.admin.name);
    EXPECT_EQ(get("/api/audit?tenant_id=" + std::to_string(s.id) +
                  "&limit=2", a).json.size(), 2u);
    // Nothing leaks to another site, and other sites' staff cannot read it.
    auto mine = get("/api/audit?tenant_id=" + std::to_string(other.id),
                    other.admin.token);
    EXPECT_EQ(mine.json.size(), 0u);
    EXPECT_EQ(get("/api/audit?tenant_id=" + std::to_string(s.id),
                  other.admin.token).status, 403);
}

TEST(Audit, OnlyAdminsAndOwnersMayRead) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto q = "/api/audit?tenant_id=" + std::to_string(o.site.id);
    EXPECT_EQ(get(q).status, 401);
    EXPECT_EQ(get(q, o.site.user.token).status, 403);
    EXPECT_EQ(get(q, o.owner.token).status, 200);
    EXPECT_EQ(get("/api/audit", o.site.admin.token).status, 400);
}

TEST(Audit, OwnerDeleteIsAttributedToTheRowsSite) {
    REQUIRE_SERVER();
    auto o = ownedSite();
    auto [cid, fid] = seedBoard(o.site);
    EXPECT_EQ(del("/api/forum/forums/" + std::to_string(fid),
                  o.owner.token).status, 200);
    sleep(1);
    auto r = get("/api/audit?tenant_id=" + std::to_string(o.site.id),
                 o.owner.token);
    EXPECT_TRUE(actions(r).count("forum.delete"));
}
