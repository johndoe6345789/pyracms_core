#pragma once

#include "http_accounts.h"

namespace gfx {
using namespace harness;

inline std::string mkImage() {
    auto uuid = drogon::utils::getUuid();
    testDb()->execSqlSync("INSERT INTO files (filename, uuid, size, "
                          "mimetype, is_picture) VALUES ($1, $1, 10, "
                          "'image/png', true)", uuid);
    return uuid;
}

struct Album {
    std::string id, pic, uuid;
};

inline Album mkAlbum(const Site &s, bool priv = false) {
    post("/api/gallery/albums", J({{"displayName", "Al"},
         {"tenantId", s.id}}), s.user.token);
    Album a{std::to_string(maxId("gallery_albums")), "", mkImage()};
    post("/api/gallery/albums/" + a.id + "/pictures",
         J({{"displayName", "P"}, {"fileUuid", a.uuid}}), s.user.token);
    a.pic = std::to_string(maxId("gallery_pictures"));
    put("/api/gallery/albums/" + a.id, J({{"displayName", "Al"},
        {"isPrivate", priv}}), s.user.token);
    return a;
}

inline std::string albumUrl(const Site &s, const Album &a) {
    return "/api/gallery/albums/" + a.id + "?tenant_id=" + std::to_string(s.id);
}

} // namespace gfx
