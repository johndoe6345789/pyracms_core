#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::getUserAchievements(
    const DbClientPtr &db, int userId,
    std::function<void(const std::vector<AchievementDto> &)> cb) {
    db->execSqlAsync(
        "SELECT a.id, a.name, a.display_name, a.description, a.icon, "
        "  ua.earned_at, "
        "  CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END AS earned "
        "FROM achievements a "
        "LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND "
        "ua.user_id = $1 "
        "ORDER BY earned DESC, a.id ASC",
        [cb](const drogon::orm::Result &result) {
            std::vector<AchievementDto> achievements;
            achievements.reserve(result.size());
            for (const auto &row : result) {
                AchievementDto dto;
                dto.id = row["id"].as<int>();
                dto.name = row["name"].as<std::string>();
                dto.displayName = row["display_name"].as<std::string>();
                dto.description = row["description"].as<std::string>();
                dto.icon = row["icon"].as<std::string>();
                dto.earned = row["earned"].as<bool>();
                dto.earnedAt = row["earned_at"].isNull()
                                   ? ""
                                   : row["earned_at"].as<std::string>();
                achievements.push_back(dto);
            }
            cb(achievements);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, userId);
}

} // namespace pyracms
