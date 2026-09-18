#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::getPost(
    const DbClientPtr &db, int postId,
    std::function<void(const std::optional<ForumPostDto> &)> cb) {
    db->execSqlAsync(
        "SELECT p.id, p.title, p.content, p.created_at, "
        "p.user_id, u.username, p.thread_id, "
        "(SELECT COUNT(*) FROM forum_post_votes v "
        "WHERE v.post_id = p.id AND v.is_like)::int AS likes, "
        "(SELECT COUNT(*) FROM forum_post_votes v "
        "WHERE v.post_id = p.id AND NOT v.is_like)::int AS dislikes "
        "FROM forum_posts p "
        "LEFT JOIN users u ON u.id = p.user_id "
        "WHERE p.id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                auto post = rowToPostDto(result[0]);
                post.likes = result[0]["likes"].as<int>();
                post.dislikes = result[0]["dislikes"].as<int>();
                cb(post);
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        postId);
}

} // namespace pyracms
