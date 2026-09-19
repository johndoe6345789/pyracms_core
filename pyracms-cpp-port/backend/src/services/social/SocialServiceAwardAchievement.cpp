#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::awardAchievement(const DbClientPtr &db, int userId,
                                     const std::string &achievementName,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO user_achievements (user_id, achievement_id) "
        "SELECT $1, id FROM achievements WHERE name = $2 "
        "ON CONFLICT DO NOTHING",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId, achievementName);
}

} // namespace pyracms
