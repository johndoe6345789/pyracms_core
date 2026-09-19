#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

void CommentService::createComment(const DbClientPtr &db, int userId,
                                   const std::string &contentType,
                                   int contentId, const std::string &body,
                                   std::optional<int> parentId,
                                   CreateCallback cb) {
    if (parentId.has_value()) {
        db->execSqlAsync(
            // A reply must belong to the same thread as its parent
            "INSERT INTO comments (user_id, content_type, content_id, body, "
            "parent_id) SELECT $1, $2::text, $3::int, $4, $5::int WHERE "
            "EXISTS (SELECT 1 FROM comments p WHERE p.id = $5::int AND "
            "p.content_type = $2::text AND p.content_id = $3::int) "
            "RETURNING id",
            [cb](const drogon::orm::Result &result) {
                if (result.empty()) {
                    cb(false, 0, "Parent comment not found");
                    return;
                }
                int newId = result[0]["id"].as<int>();
                cb(true, newId, "");
            },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, 0, dbError(e));
            },
            userId, contentType, contentId, body, parentId.value());
    } else {
        db->execSqlAsync(
            "INSERT INTO comments (user_id, content_type, content_id, body) "
            "VALUES ($1, $2, $3, $4) RETURNING id",
            [cb](const drogon::orm::Result &result) {
                int newId = result[0]["id"].as<int>();
                cb(true, newId, "");
            },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, 0, dbError(e));
            },
            userId, contentType, contentId, body);
    }
}

} // namespace pyracms
