#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::getFollowers(
    const DbClientPtr &db, int userId, int limit, int offset,
    std::function<void(const std::vector<UserFollowDto> &, int)> cb) {
    db->execSqlAsync(
        "SELECT u.id AS user_id, u.username, u.avatar_url, f.created_at, "
        "  (SELECT COUNT(*) FROM follows WHERE followed_id = $1)::int AS total "
        "FROM follows f "
        "JOIN users u ON u.id = f.follower_id "
        "WHERE f.followed_id = $1 "
        "ORDER BY f.created_at DESC LIMIT $2::int OFFSET $3::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<UserFollowDto> followers;
            int total = 0;
            for (const auto &row : result) {
                UserFollowDto dto;
                dto.userId = row["user_id"].as<int>();
                dto.username = row["username"].as<std::string>();
                dto.avatarUrl = row["avatar_url"].isNull()
                                    ? ""
                                    : row["avatar_url"].as<std::string>();
                dto.createdAt = row["created_at"].as<std::string>();
                total = row["total"].as<int>();
                followers.push_back(dto);
            }
            cb(followers, total);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}, 0); }, userId,
        limit, offset);
}

} // namespace pyracms
