#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

void CommentService::deleteComment(const DbClientPtr &db, int commentId,
                                   int userId, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM comments WHERE id = $1 AND user_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Comment not found or not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        commentId, userId);
}

} // namespace pyracms
