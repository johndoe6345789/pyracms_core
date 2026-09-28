#pragma once

#include "http_accounts.h"

namespace vfx {
using namespace harness;

// A files row owned by `a` on site `tenant` (no bytes needed).
inline std::string mkFile(const Acct &a, int tenant,
                          const std::string &mime = "video/mp4") {
    auto uuid = drogon::utils::getUuid();
    bool pic = mime.rfind("image/", 0) == 0;
    testDb()->execSqlSync(
        "INSERT INTO files (filename, uuid, size, mimetype, is_picture, "
        "is_video, user_id, tenant_id) VALUES ($1, $1, 10, $2, $3, $4, "
        "$5, $6)",
        uuid, mime, pic, !pic, a.id, tenant);
    return uuid;
}

// Uploads a video as `a` and returns its id ("" on failure).
inline std::string mkVideo(const Site &s, const Acct &a,
                           Json::Value body = Json::Value()) {
    if (!body.isObject())
        body = J({{"title", "Clip"}});
    body["tenantId"] = s.id;
    body["fileUuid"] = mkFile(a, s.id);
    auto r = post("/api/videos", body, a.token);
    return r.status == 201 ? std::to_string(r.json["id"].asInt()) : "";
}

inline std::string videoUrl(const Site &s, const std::string &id,
                            const std::string &tail = "") {
    return "/api/videos/" + id + tail + "?tenant_id=" + std::to_string(s.id);
}

inline std::string listUrl(const Site &s, const std::string &extra = "") {
    return "/api/videos?tenant_id=" + std::to_string(s.id) + extra;
}

} // namespace vfx
