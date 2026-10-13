#include "services/DbError.h"
#include "services/VideoService.h"

namespace pyracms {

void VideoService::updateVideo(const DbClientPtr &db, int id,
                               const VideoInput &in, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE videos v SET title = $2::text, description = $3::text, "
        "visibility = $4::text, thumbnail_uuid = $5::text, "
        "duration_seconds = $6::int, updated_at = NOW() "
        "WHERE v.id = $1::int AND ($5::text = '' "
        "OR $5::text = v.thumbnail_uuid OR EXISTS (SELECT 1 FROM files t "
        "WHERE t.uuid = $5::text AND t.tenant_id = v.tenant_id "
        "AND t.is_picture)) RETURNING v.id",
        [cb](const drogon::orm::Result &r) {
            if (r.empty())
                return cb(false,
                          "thumbnailUuid must be a picture on this site");
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        id, in.title, in.description, in.visibility, in.thumbnailUuid,
        in.durationSeconds);
}

void VideoService::deleteVideo(const DbClientPtr &db, int id, BoolCallback cb) {
    db->execSqlAsync(
        "WITH gone AS (DELETE FROM videos WHERE id = $1::int "
        "RETURNING id) DELETE FROM comments WHERE content_type = 'video' "
        "AND content_id IN (SELECT id FROM gone)",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        id);
}

} // namespace pyracms
