#include "http_accounts.h"

using namespace harness;

static const Json::Value kEmpty(Json::objectValue);

TEST(GameDepHttp, DependenciesShotsVotesAndTags) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto o = s.admin.token;
    auto dep = uniq("dep");
    auto game = uniq("gm");
    post("/api/gamedep/dep", J({{"name", dep}}), o);
    post("/api/gamedep/dep/" + dep + "/revisions", J({{"version", "3"}}), o);
    post("/api/gamedep/game", J({{"name", game}}), o);
    auto base = "/api/gamedep/game/" + game;
    // pyracms dep by name+version, then again (duplicate), then unknown.
    auto link = J({{"kind", "pyracms"}, {"name", dep}, {"version", "3"}});
    EXPECT_EQ(post(base + "/dependencies", link, o).status, 201);
    EXPECT_EQ(post(base + "/dependencies", link, o).status, 409);
    EXPECT_EQ(post(base + "/dependencies", J({{"name", "zz"},
                   {"version", "9"}}), o).status, 404);
    auto page = get(base + "?tenant_id=" + std::to_string(s.id), o);
    ASSERT_EQ(page.status, 200);
    auto depId = std::to_string(page.json["dependencies"][0]["id"].asInt());
    EXPECT_EQ(del(base + "/dependencies/" + depId, o).status, 200);
    EXPECT_EQ(del(base + "/dependencies/" + depId, o).status, 404);
    EXPECT_EQ(put(base + "/pip", kEmpty, o).status, 400);
    EXPECT_EQ(put(base + "/pip", J({{"pipRequirements",
                  A({"pygame==2.6.1", "numpy>=1.0", ""})}}), o).status, 200);
    EXPECT_EQ(put(base + "/tags", kEmpty, o).status, 400);
    EXPECT_EQ(put(base + "/tags", J({{"tags", A({"a", "a", "b", ""})}}), o)
                  .status, 200);
    EXPECT_EQ(post(base + "/vote", kEmpty, o).status, 400);
    EXPECT_EQ(post(base + "/vote", J({{"isLike", true}}), s.user.token)
                  .status, 200);
    EXPECT_EQ(post(base + "/vote", J({{"isLike", false}}), s.user.token)
                  .status, 200);
    auto f = uniq("shot");
    testDb()->execSqlSync("INSERT INTO files (filename, uuid) VALUES ($1, $1)",
                          f);
    auto sh = post(base + "/screenshots", J({{"fileUuid", f}}), o);
    ASSERT_EQ(sh.status, 201);
    EXPECT_EQ(post(base + "/screenshots", J({{"fileUuid", f},
                   {"default", true}}), o).status, 201);
    EXPECT_EQ(post(base + "/screenshots", kEmpty, o).status, 400);
    auto id = std::to_string(sh.json["id"].asInt());
    EXPECT_EQ(del(base + "/screenshots/" + id, o).status, 200);
    EXPECT_EQ(del(base + "/screenshots/" + id, o).status, 404);
    EXPECT_EQ(post("/api/gamedep/game/none/vote", J({{"isLike", true}}), o)
                  .status, 404);
    auto owner2 = s.user.token;
    EXPECT_EQ(post(base + "/dependencies", link, owner2).status, 403);
    auto list = get("/api/gamedep/game?tenant_id=" + std::to_string(s.id) +
                    "&tag=a&q=" + game.substr(0, 3));
    EXPECT_EQ(list.status, 200);
}
