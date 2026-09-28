#include "services/DbError.h"
#include "services/VideoService.h"

namespace pyracms {

// Inserts only when the file is a playable video the user uploaded to
// this site and the poster (if any) is a picture of the same site.
void VideoService::createVideo(const DbClientPtr &db, int tenantId, int userId,
                               const std::string &fileUuid,
                               const VideoInput &in, CreateCallback cb) {
    db->execSqlAsync(
        "INSERT INTO videos (tenant_id, user_id, title, description, "
        "file_uuid, thumbnail_uuid, duration_seconds, visibility) "
        "SELECT $1::int, $2::int, $3::text, $4::text, f.uuid, $6::text, "
        "$7::int, $8::text FROM files f WHERE f.uuid = $5::text "
        "AND f.tenant_id = $1::int AND f.user_id = $2::int "
        "AND f.mimetype IN ('video/mp4', 'video/webm') "
        "AND ($6::text = '' OR EXISTS (SELECT 1 FROM files t WHERE "
        "t.uuid = $6::text AND t.tenant_id = $1::int AND t.is_picture)) "
        "RETURNING id",
        [cb](const drogon::orm::Result &r) {
            if (r.empty())
                return cb(false, 0,
                          "fileUuid must be an MP4 or WebM video you "
                          "uploaded to this site (and thumbnailUuid a "
                          "picture on it)");
            cb(true, r[0]["id"].as<int>(), "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, dbError(e));
        },
        tenantId, userId, in.title, in.description, fileUuid, in.thumbnailUuid,
        in.durationSeconds, in.visibility);
}

} // namespace pyracms
