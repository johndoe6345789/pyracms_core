#include "services/CommentService.h"

namespace pyracms {

CommentDto CommentService::rowToDto(const drogon::orm::Row &row) {
    CommentDto dto;
    dto.id = row["id"].as<int>();
    dto.userId = row["user_id"].as<int>();
    dto.username = row["username"].as<std::string>();
    dto.contentType = row["content_type"].as<std::string>();
    dto.contentId = row["content_id"].as<int>();
    dto.parentId = row["parent_id"].isNull() ? 0 : row["parent_id"].as<int>();
    dto.body = row["body"].as<std::string>();
    dto.likes = row["likes"].as<int>();
    dto.dislikes = row["dislikes"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.updatedAt = row["updated_at"].as<std::string>();
    return dto;
}

void CommentService::createComment(const DbClientPtr &db,
                                    int userId,
                                    const std::string &contentType,
                                    int contentId,
                                    const std::string &body,
                                    std::optional<int> parentId,
                                    CreateCallback cb) {
    if (parentId.has_value()) {
        db->execSqlAsync(
            "INSERT INTO comments (user_id, content_type, content_id, body, parent_id) "
            "VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [cb](const drogon::orm::Result &result) {
                int newId = result[0]["id"].as<int>();
                cb(true, newId, "");
            },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, 0, e.base().what());
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
                cb(false, 0, e.base().what());
            },
            userId, contentType, contentId, body);
    }
}

void CommentService::getComments(const DbClientPtr &db,
                                  const std::string &contentType,
                                  int contentId,
                                  int limit,
                                  int offset,
                                  ListCallback cb) {
    db->execSqlAsync(
        "SELECT c.*, u.username, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND is_like = TRUE), 0) as likes, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND is_like = FALSE), 0) as dislikes "
        "FROM comments c "
        "JOIN users u ON c.user_id = u.id "
        "WHERE c.content_type = $1 AND c.content_id = $2 "
        "ORDER BY c.created_at ASC LIMIT $3 OFFSET $4",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<CommentDto> comments;
            comments.reserve(result.size());
            for (const auto &row : result) {
                comments.push_back(rowToDto(row));
            }
            cb(comments);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        contentType, contentId, limit, offset);
}

void CommentService::updateComment(const DbClientPtr &db,
                                    int commentId,
                                    int userId,
                                    const std::string &body,
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
            cb(false, e.base().what());
        },
        body, commentId, userId);
}

void CommentService::deleteComment(const DbClientPtr &db,
                                    int commentId,
                                    int userId,
                                    BoolCallback cb) {
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
            cb(false, e.base().what());
        },
        commentId, userId);
}

void CommentService::voteComment(const DbClientPtr &db,
                                  int commentId,
                                  int userId,
                                  bool isLike,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO comment_votes (comment_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (comment_id, user_id) "
        "DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        commentId, userId, isLike);
}

void CommentService::findById(const DbClientPtr &db,
                               int commentId,
                               SingleCallback cb) {
    db->execSqlAsync(
        "SELECT c.*, u.username, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND is_like = TRUE), 0) as likes, "
        "COALESCE((SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND is_like = FALSE), 0) as dislikes "
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
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        commentId);
}

} // namespace pyracms
