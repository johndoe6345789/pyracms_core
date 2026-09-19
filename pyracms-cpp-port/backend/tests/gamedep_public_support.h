#pragma once

#include "http_accounts.h"

// A game/dep with one revision carrying real uploaded bytes: a source
// archive, a linux binary and a screenshot.
struct GdFixture {
    std::string name, type, src, bin, shot;
    std::string path() const { return "/api/gamedep/" + type + "/" + name; }
};

inline const std::string kBin = std::string(300, 'B') + "END";

inline std::string uploadBytes(const std::string &token,
                               const std::string &file,
                               const std::string &bytes) {
    auto up = harness::upload("/api/files", token, file, bytes);
    return up.json["uuid"].asString();
}

inline GdFixture mkPublicGd(const std::string &token, bool priv,
                            bool publish, const std::string &type = "game") {
    using namespace harness;
    GdFixture g;
    g.type = type;
    g.name = uniq("pg");
    g.src = uploadBytes(token, "src.zip", "PK-source");
    g.bin = uploadBytes(token, "game.bin", kBin);
    g.shot = uploadBytes(token, "s.txt", "shot-bytes");
    post("/api/gamedep/" + type,
         J({{"name", g.name}, {"isPrivate", priv}}), token);
    auto rev = g.path() + "/revisions";
    post(rev, J({{"version", "1.0.0"}}), token);
    post(rev + "/1.0.0/source", J({{"fileUuid", g.src}}), token);
    post(rev + "/1.0.0/binaries",
         J({{"os", "lin"}, {"arch", "x86_64"}, {"fileUuid", g.bin}}), token);
    post(g.path() + "/screenshots", J({{"fileUuid", g.shot}}), token);
    if (publish)
        post(rev + "/1.0.0/publish", Json::Value(Json::objectValue), token);
    return g;
}

inline bool listed(const Json::Value &arr, const std::string &name) {
    for (const auto &p : arr) {
        if (p["name"].asString() == name)
            return true;
    }
    return false;
}
