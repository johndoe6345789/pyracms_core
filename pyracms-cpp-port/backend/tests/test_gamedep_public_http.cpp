#include "gamedep_public_support.h"

using namespace harness;

// Launcher flow: browse, detail and catalog work without a token, but
// only for public games (not private ones, not drafts).
TEST(GamedepPublic, AnonymousBrowsesOnlyPublicGames) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto o = s.admin.token;
    auto pub = mkPublicGd(o, false, true);
    auto priv = mkPublicGd(o, true, true);
    auto draft = mkPublicGd(o, false, false);
    auto q = "?tenant_id=" + std::to_string(s.id);
    auto list = get("/api/gamedep/game" + q);
    ASSERT_EQ(list.status, 200);
    EXPECT_TRUE(listed(list.json, pub.name));
    EXPECT_FALSE(listed(list.json, priv.name));
    EXPECT_FALSE(listed(list.json, draft.name));
    auto d = get(pub.path() + q);
    ASSERT_EQ(d.status, 200);
    EXPECT_EQ(d.json["visibility"].asString(), "public");
    EXPECT_FALSE(d.json["isPrivate"].asBool());
    EXPECT_EQ(d.json["revisions"][0]["binaries"][0]["os"].asString(), "lin");
    EXPECT_EQ(d.json["screenshots"].size(), 1u);
    EXPECT_EQ(get(priv.path() + q).status, 404);
    EXPECT_EQ(get(draft.path() + q).status, 404);
    auto cat = get("/api/gamedep/catalog" + q);
    ASSERT_EQ(cat.status, 200);
    ASSERT_EQ(cat.json["gamedep"].size(), 1u);
    EXPECT_EQ(cat.json["gamedep"][0]["game"]["name"].asString(), pub.name);
    // Managers still see their private page and its draft.
    EXPECT_EQ(get(priv.path() + q, o).status, 200);
    EXPECT_EQ(get(draft.path() + q, o).status, 200);
    EXPECT_EQ(get(priv.path() + q, s.user.token).status, 404);
}

TEST(GamedepPublic, VisibilityCanBeToggledByOwner) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto o = s.admin.token;
    auto g = mkPublicGd(o, false, true);
    auto q = "?tenant_id=" + std::to_string(s.id);
    EXPECT_EQ(put(g.path(), J({{"visibility", "private"}}), o).status, 200);
    EXPECT_EQ(get(g.path() + q).status, 404);
    EXPECT_EQ(get("/api/files/" + g.bin).status, 404);
    EXPECT_EQ(put(g.path(), J({{"visibility", "public"}}), o).status, 200);
    EXPECT_EQ(get(g.path() + q).status, 200);
    EXPECT_EQ(get("/api/files/" + g.bin).status, 200);
    EXPECT_EQ(put(g.path(), J({{"isPrivate", true}}), s.user.token).status,
              403);
}

TEST(GamedepPublic, PublicDependencyIsDownloadableToo) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto o = s.admin.token;
    auto dep = mkPublicGd(o, false, true, "dep");
    auto hidden = mkPublicGd(o, true, true, "dep");
    auto game = mkPublicGd(o, false, true);
    auto link = J({{"kind", "pyracms"}, {"name", dep.name},
                   {"version", "1.0.0"}});
    EXPECT_EQ(post(game.path() + "/dependencies", link, o).status, 201);
    auto d = get(game.path() + "?tenant_id=" + std::to_string(s.id));
    EXPECT_EQ(d.json["dependencies"][0]["kind"].asString(), "pyracms");
    EXPECT_EQ(get("/api/files/" + dep.bin).text, kBin);
    EXPECT_EQ(get("/api/files/" + dep.src).status, 200);
    EXPECT_EQ(get("/api/files/" + hidden.bin).status, 404);
}
