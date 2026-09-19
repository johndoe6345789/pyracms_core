#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

void CommentService::getComments(const DbClientPtr &db,
                                 const std::string &contentType, int contentId,
                                 int limit, int offset, ListCallback cb) {
    db->execSqlAsync(
        "SELECT c.*, u.username, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id "
        "AND is_like = TRUE), 0) as likes, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id "
        "AND is_like = FALSE), 0) as dislikes "
        "FROM comments c "
        "JOIN users u ON c.user_id = u.id "
        "WHERE c.content_type = $1 AND c.content_id = $2 "
        "ORDER BY c.created_at ASC LIMIT $3::int OFFSET $4::int",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<CommentDto> comments;
            comments.reserve(result.size());
            for (const auto &row : result) {
                comments.push_back(rowToDto(row));
            }
            cb(comments);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, contentType,
        contentId, limit, offset);
}

} // namespace pyracms
