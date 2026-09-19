#include "http_accounts.h"

using namespace harness;

static std::string mkFile(const std::string &sha = "") {
    auto uuid = uniq("fu");
    testDb()->execSqlSync("INSERT INTO files (filename, uuid, size, sha256, "
                          "download_count) VALUES ($1, $1, 1234, $2, 7)",
                          uuid, sha);
    return uuid;
}

TEST(GameDepHttp, FullGameLifecycleAndCatalogShape) {
    REQUIRE_SERVER();
    auto admin = platformAdmin();
    std::string slug;
    int tid = newTenant(admin, slug);
    auto owner = signup(slug, 3);
    auto game = uniq("game");
    auto base = "/api/gamedep/game/" + game;
    Json::Value page;
    page["name"] = game;
    page["displayName"] = "Game";
    page["description"] = "d";
    EXPECT_EQ(post("/api/gamedep/game", page, owner.token).status, 201);
    EXPECT_EQ(post("/api/gamedep/game", page, owner.token).status, 409);
    Json::Value rev;
    rev["version"] = "1.0.0";
    rev["moduleType"] = "python";
    EXPECT_EQ(post(base + "/revisions", rev, owner.token).status, 201);
    auto sha = std::string(64, 'a');
    Json::Value bin;
    bin["os"] = "lin";
    bin["arch"] = "x86_64";
    bin["fileUuid"] = mkFile(sha);
    bin["sha256"] = sha;
    auto rb = post(base + "/revisions/1.0.0/binaries", bin, owner.token);
    EXPECT_EQ(rb.status, 201);
    Json::Value pip;
    pip["pipRequirements"].append("pygame==2.6.1");
    EXPECT_EQ(put(base + "/pip", pip, owner.token).status, 200);
    EXPECT_EQ(put(base + "/tags", J({{"tags", A({"a"})}}), owner.token)
                  .status, 200);
    Json::Value dep;
    dep["kind"] = "pip";
    dep["name"] = "numpy";
    dep["version"] = "1.26";
    EXPECT_EQ(post(base + "/dependencies", dep, owner.token).status, 201);
    Json::Value shot;
    shot["fileUuid"] = mkFile();
    shot["default"] = true;
    EXPECT_EQ(post(base + "/screenshots", shot, owner.token).status, 201);
    EXPECT_EQ(
        post(base + "/revisions/1.0.0/publish", Json::Value(Json::objectValue),
             owner.token)
            .json["published"]
            .asBool(),
        true);
    auto cat = get("/api/gamedep/catalog?tenant_id=" + std::to_string(tid));
    ASSERT_EQ(cat.status, 200);
    const auto &g = cat.json["gamedep"][0]["game"];
    EXPECT_EQ(g["name"].asString(), game);
    EXPECT_EQ(g["ownerUsername"].asString(), owner.name);
    const auto &b = g["revisions"][0]["binaries"][0];
    EXPECT_EQ(b["os"].asString(), "lin");
    EXPECT_EQ(b["arch"].asString(), "x86_64");
    EXPECT_EQ(b["sha256"].asString(), sha);
    EXPECT_EQ(b["size"].asInt(), 1234);
    EXPECT_EQ(b["downloadCount"].asInt(), 7);
    EXPECT_NE(b["url"].asString().find("/api/files/"), std::string::npos);
    EXPECT_EQ(g["dependencies"].size(), 2u);
    EXPECT_EQ(g["screenshots"].size(), 1u);
    EXPECT_EQ(g["downloadCount"].asInt(), 7);
}
