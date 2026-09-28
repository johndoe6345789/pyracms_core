#include "services/VideoService.h"
#include "services/VideoSql.h"

namespace pyracms {

// One video the viewer may see; counting a view bumps view_count in the
// same statement so the reply already includes it.
void VideoService::getVideo(const DbClientPtr &db, int id,
                            const VideoLookup &look, VideoCallback cb) {
    std::string pick = look.countView
                           ? "UPDATE videos SET view_count = view_count + 1 "
                             "WHERE id = $1::int AND "
                           : "SELECT * FROM videos WHERE id = $1::int AND ";
    std::string tail = look.countView ? " RETURNING *" : "";
    db->execSqlAsync(
        "WITH hit AS (" + pick + kVideoVisible + tail + ") " +
            videoSelect("hit", "$3"),
        [cb](const drogon::orm::Result &r) {
            if (r.empty())
                return cb(std::nullopt);
            cb(videoRowToDto(r[0]));
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); }, id,
        look.tenant, look.viewerId, look.anyVisibility);
}

} // namespace pyracms
