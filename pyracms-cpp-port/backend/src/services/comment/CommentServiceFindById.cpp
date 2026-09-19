#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

void CommentService::findById(const DbClientPtr &db, int commentId,
                              SingleCallback cb) {
    db->execSqlAsync(
        "SELECT c.*, u.username, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id "
        "AND is_like = TRUE), 0) as likes, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id "
        "AND is_like = FALSE), 0) as dislikes "
        "FROM comments c "
        "JOIN users u ON c.user_id = u.id "
        "WHERE c.id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        commentId);
}

} // namespace pyracms
