#include "controllers/GalleryFeaturedController.h"
#include "controllers/QueryInt.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Only pictures (not videos) in albums anyone may see. 404 = nothing to show.
void GalleryFeaturedController::random(HttpReq req, HttpCbRef callback) {
    int tenant = queryInt(req->getParameter("tenant_id"), 0);
    if (tenant <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT p.id, p.display_name, p.album_id, p.file_uuid, "
        "a.display_name AS album_name FROM gallery_pictures p "
        "JOIN gallery_albums a ON a.id = p.album_id "
        "JOIN files f ON f.uuid = p.file_uuid "
        "WHERE a.tenant_id = $1 AND NOT a.is_private AND NOT p.is_private "
        "AND f.mimetype LIKE 'image/%' ORDER BY random() LIMIT 1",
        [callback](const drogon::orm::Result &rows) {
            if (rows.empty())
                return callback(filterError("No pictures yet",
                                            drogon::k404NotFound));
            Json::Value r;
            r["id"] = rows[0]["id"].as<int>();
            r["displayName"] = rows[0]["display_name"].as<std::string>();
            r["albumId"] = rows[0]["album_id"].as<int>();
            r["albumName"] = rows[0]["album_name"].as<std::string>();
            r["fileUuid"] = rows[0]["file_uuid"].as<std::string>();
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            callback(filterError("Database error",
                                 drogon::k500InternalServerError));
        },
        tenant);
}

} // namespace pyracms
