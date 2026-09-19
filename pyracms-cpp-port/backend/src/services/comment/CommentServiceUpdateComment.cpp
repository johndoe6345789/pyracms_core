#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

void CommentService::updateComment(const DbClientPtr &db, int commentId,
                                   int userId, const std::string &body,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE comments SET body = $1, updated_at = NOW() "
        "WHERE id = $2 AND user_id = $3",
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
        body, commentId, userId);
}

} // namespace pyracms
