#include "http_accounts.h"

using namespace harness;

static const Json::Value kEmpty(Json::objectValue);

static std::string mkFile() {
    auto uuid = uniq("g3");
    testDb()->execSqlSync("INSERT INTO files (filename, uuid, size) "
                          "VALUES ($1, $1, 5)", uuid);
    return uuid;
}

TEST(GameDepHttp, PageAndRevisionMaintenance) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto o = s.admin.token;
    auto n = uniq("maint");
    auto base = "/api/gamedep/game/" + n;
    EXPECT_EQ(post("/api/gamedep/game", J({{"name", n}}), o).status, 201);
    EXPECT_EQ(put(base, J({{"displayName", "D"}, {"description", "x"}}), o)
                  .status, 200);
    EXPECT_EQ(put("/api/gamedep/game/none", kEmpty, o).status, 404);
    EXPECT_EQ(put(base, kEmpty, s.user.token).status, 403);
    EXPECT_EQ(post(base + "/revisions", J({{"version", "1"}}), o).status,
              201);
    EXPECT_EQ(put(base + "/revisions/1",
                  J({{"version", "1.1"}, {"moduleType", "native"},
                     {"executable", "run.sh"}}), o).status, 200);
    EXPECT_EQ(put(base + "/revisions/zz", kEmpty, o).status, 404);
    EXPECT_EQ(post(base + "/revisions/1.1/source",
                   J({{"fileUuid", mkFile()}}), o).status, 200);
    EXPECT_EQ(post(base + "/revisions/1.1/source", kEmpty, o).status, 400);
    EXPECT_EQ(post(base + "/revisions/1.1/binaries",
                   J({{"os", "nope"}, {"arch", "x86_64"},
                      {"fileUuid", mkFile()}}), o).status, 400);
    EXPECT_EQ(post(base + "/revisions/1.1/binaries", kEmpty, o).status, 400);
    EXPECT_EQ(post(base + "/revisions/1.1/binaries",
                   J({{"os", "lin"}, {"arch", "x86_64"},
                      {"fileUuid", "missing"}}), o).status, 404);
    auto f = mkFile();
    auto good = J({{"osId", 1}, {"archId", 1}, {"fileUuid", f}});
    auto b = post(base + "/revisions/1.1/binaries", good, o);
    ASSERT_EQ(b.status, 201);
    EXPECT_EQ(post(base + "/revisions/1.1/binaries", good, o).status, 409);
    auto bid = std::to_string(b.json["id"].asInt());
    EXPECT_EQ(del(base + "/revisions/1.1/binaries/" + bid, o).status, 200);
    EXPECT_EQ(del(base + "/revisions/1.1/binaries/" + bid, o).status, 404);
    EXPECT_EQ(post("/api/gamedep/bogus/x/revisions", kEmpty, o).status, 400);
    EXPECT_EQ(put("/api/gamedep/bogus/x/revisions/1", kEmpty, o).status,
              400);
    EXPECT_EQ(del("/api/gamedep/bogus/x/revisions/1", o).status, 400);
    EXPECT_EQ(post("/api/gamedep/bogus/x/revisions/1/publish", kEmpty, o)
                  .status, 400);
    EXPECT_EQ(del(base + "/revisions/1.1", o).status, 200);
    EXPECT_EQ(del(base, o).status, 200);
    EXPECT_EQ(del(base, o).status, 404);
    EXPECT_EQ(put("/api/gamedep/bogus/x", kEmpty, o).status, 400);
    EXPECT_EQ(del("/api/gamedep/bogus/x", o).status, 400);
    EXPECT_EQ(post("/api/gamedep/bogus", kEmpty, o).status, 400);
}
