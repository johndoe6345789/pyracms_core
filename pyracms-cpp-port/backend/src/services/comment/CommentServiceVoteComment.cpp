#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

void CommentService::voteComment(const DbClientPtr &db, int commentId,
                                 int userId, bool isLike, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO comment_votes (comment_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (comment_id, user_id) "
        "DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        commentId, userId, isLike);
}

} // namespace pyracms
