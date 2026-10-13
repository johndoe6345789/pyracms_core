#include "services/VideoService.h"
#include "services/VideoSql.h"

namespace pyracms {

// Public videos of a site; an uploader browsing their own channel
// (userId == viewerId) also sees their unlisted and private ones.
void VideoService::listVideos(const DbClientPtr &db, const VideoQuery &q,
                              ListCallback cb) {
    std::string order = q.popular ? "v.view_count DESC, v.id DESC"
                                  : "v.created_at DESC, v.id DESC";
    std::string pattern = q.text.empty() ? "" : likePattern(q.text);
    db->execSqlAsync(
        videoSelect("videos", "$2", ", COUNT(*) OVER () AS total_count") +
            "WHERE v.tenant_id = $1::int "
            "AND ($3::int = 0 OR v.user_id = $3::int) "
            "AND (v.visibility = 'public' OR "
            "($3::int <> 0 AND $3::int = $2::int)) "
            "AND ($4::text = '' OR v.title ILIKE $4::text "
            "OR v.description ILIKE $4::text) "
            "ORDER BY " +
            order + " LIMIT $5::int OFFSET $6::int",
        [cb](const drogon::orm::Result &r) {
            std::vector<VideoDto> items;
            items.reserve(r.size());
            for (const auto &row : r)
                items.push_back(videoRowToDto(row));
            int total = r.empty() ? 0 : r[0]["total_count"].as<int>();
            cb(items, total);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}, 0); }, q.tenantId,
        q.viewerId, q.userId, pattern, q.limit, q.offset);
}

} // namespace pyracms
