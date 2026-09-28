#include "services/DbError.h"
#include "services/VideoService.h"
#include "services/VideoSql.h"

namespace pyracms {

// $1 video, $2 site, $3 voter, $4 false (the kVideoVisible slots).
void VideoService::vote(const DbClientPtr &db, int id, int userId, int tenant,
                        std::optional<bool> isLike, VoteCallback cb) {
    auto next = [this, db, id, userId, tenant,
                 cb](const drogon::orm::Result &) {
        tally(db, id, userId, tenant, cb);
    };
    auto fail = [cb](const drogon::orm::DrogonDbException &e) {
        cb(false, {}, dbError(e));
    };
    if (!isLike)
        return db->execSqlAsync(
            "DELETE FROM video_votes WHERE video_id = $1::int "
            "AND user_id = $2::int",
            next, fail, id, userId);
    db->execSqlAsync(
        std::string("INSERT INTO video_votes (video_id, user_id, is_like) "
                    "SELECT id, $3::int, $5::bool FROM videos WHERE "
                    "id = $1::int AND ") +
            kVideoVisible +
            " ON CONFLICT (video_id, user_id) "
            "DO UPDATE SET is_like = EXCLUDED.is_like",
        next, fail, id, tenant, userId, false, *isLike);
}

void VideoService::tally(const DbClientPtr &db, int id, int userId, int tenant,
                         VoteCallback cb) {
    db->execSqlAsync(
        videoSelect("(SELECT * FROM videos WHERE id = $1::int AND " +
                        std::string(kVideoVisible) + ")",
                    "$3"),
        [cb](const drogon::orm::Result &r) {
            if (r.empty())
                return cb(false, {}, "Not found");
            auto d = videoRowToDto(r[0]);
            cb(true, {d.likes, d.dislikes, d.myVote}, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, {}, dbError(e));
        },
        id, tenant, userId, false);
}

} // namespace pyracms
