#include "services/SocialService.h"

#include <regex>
#include <memory>
#include <mutex>

namespace pyracms {

void SocialService::followUser(const DbClientPtr &db, int followerId, int followedId,
                                BoolCallback cb) {
    if (followerId == followedId) {
        cb(false, "Cannot follow yourself");
        return;
    }

    db->execSqlAsync(
        "INSERT INTO follows (follower_id, followed_id) "
        "VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        followerId, followedId);
}

void SocialService::unfollowUser(const DbClientPtr &db, int followerId, int followedId,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Not following this user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        followerId, followedId);
}

void SocialService::isFollowing(const DbClientPtr &db, int followerId, int followedId,
                                 std::function<void(bool)> cb) {
    db->execSqlAsync(
        "SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2",
        [cb](const drogon::orm::Result &result) {
            cb(!result.empty());
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(false);
        },
        followerId, followedId);
}

void SocialService::getFollowers(const DbClientPtr &db, int userId, int limit, int offset,
                                  std::function<void(const std::vector<UserFollowDto> &, int)> cb) {
    db->execSqlAsync(
        "SELECT u.id AS user_id, u.username, u.avatar_url, f.created_at, "
        "  (SELECT COUNT(*) FROM follows WHERE followed_id = $1)::int AS total "
        "FROM follows f "
        "JOIN users u ON u.id = f.follower_id "
        "WHERE f.followed_id = $1 "
        "ORDER BY f.created_at DESC LIMIT $2 OFFSET $3",
        [cb](const drogon::orm::Result &result) {
            std::vector<UserFollowDto> followers;
            int total = 0;
            for (const auto &row : result) {
                UserFollowDto dto;
                dto.userId = row["user_id"].as<int>();
                dto.username = row["username"].as<std::string>();
                dto.avatarUrl = row["avatar_url"].isNull() ? "" : row["avatar_url"].as<std::string>();
                dto.createdAt = row["created_at"].as<std::string>();
                total = row["total"].as<int>();
                followers.push_back(dto);
            }
            cb(followers, total);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({}, 0);
        },
        userId, limit, offset);
}

void SocialService::getFollowing(const DbClientPtr &db, int userId, int limit, int offset,
                                  std::function<void(const std::vector<UserFollowDto> &, int)> cb) {
    db->execSqlAsync(
        "SELECT u.id AS user_id, u.username, u.avatar_url, f.created_at, "
        "  (SELECT COUNT(*) FROM follows WHERE follower_id = $1)::int AS total "
        "FROM follows f "
        "JOIN users u ON u.id = f.followed_id "
        "WHERE f.follower_id = $1 "
        "ORDER BY f.created_at DESC LIMIT $2 OFFSET $3",
        [cb](const drogon::orm::Result &result) {
            std::vector<UserFollowDto> following;
            int total = 0;
            for (const auto &row : result) {
                UserFollowDto dto;
                dto.userId = row["user_id"].as<int>();
                dto.username = row["username"].as<std::string>();
                dto.avatarUrl = row["avatar_url"].isNull() ? "" : row["avatar_url"].as<std::string>();
                dto.createdAt = row["created_at"].as<std::string>();
                total = row["total"].as<int>();
                following.push_back(dto);
            }
            cb(following, total);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({}, 0);
        },
        userId, limit, offset);
}

void SocialService::getActivityFeed(const DbClientPtr &db, int userId,
                                     int limit, int offset,
                                     std::function<void(const std::vector<ActivityItem> &)> cb) {
    db->execSqlAsync(
        "("
        "  SELECT 'article' AS type, a.id, a.display_name AS title, "
        "  '' AS summary, a.created_at "
        "  FROM articles a WHERE a.user_id = $1"
        ") UNION ALL ("
        "  SELECT 'forum_post' AS type, p.id, COALESCE(p.title, '') AS title, "
        "  LEFT(p.content, 200) AS summary, p.created_at "
        "  FROM forum_posts p WHERE p.user_id = $1"
        ") UNION ALL ("
        "  SELECT 'snippet' AS type, s.id, s.title, "
        "  LEFT(s.code, 200) AS summary, s.created_at "
        "  FROM code_snippets s WHERE s.author_id = $1"
        ") ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [cb](const drogon::orm::Result &result) {
            std::vector<ActivityItem> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                ActivityItem item;
                item.type = row["type"].as<std::string>();
                item.id = row["id"].as<int>();
                item.title = row["title"].as<std::string>();
                item.summary = row["summary"].isNull() ? "" : row["summary"].as<std::string>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        userId, limit, offset);
}

void SocialService::getUserAchievements(const DbClientPtr &db, int userId,
                                         std::function<void(const std::vector<AchievementDto> &)> cb) {
    db->execSqlAsync(
        "SELECT a.id, a.name, a.display_name, a.description, a.icon, "
        "  ua.earned_at, "
        "  CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END AS earned "
        "FROM achievements a "
        "LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = $1 "
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
                dto.earnedAt = row["earned_at"].isNull() ? "" : row["earned_at"].as<std::string>();
                achievements.push_back(dto);
            }
            cb(achievements);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        userId);
}

void SocialService::awardAchievement(const DbClientPtr &db, int userId,
                                      const std::string &achievementName,
                                      BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO user_achievements (user_id, achievement_id) "
        "SELECT $1, id FROM achievements WHERE name = $2 "
        "ON CONFLICT DO NOTHING",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, achievementName);
}

void SocialService::checkAndAwardAchievements(const DbClientPtr &db, int userId,
                                                BoolCallback cb) {
    // Check first_post: user has at least 1 forum post
    db->execSqlAsync(
        "SELECT "
        "  (SELECT COUNT(*) FROM forum_posts WHERE user_id = $1) AS post_count, "
        "  (SELECT COUNT(*) FROM articles WHERE user_id = $1) AS article_count, "
        "  (SELECT COUNT(*) FROM code_snippets WHERE author_id = $1) AS snippet_count, "
        "  (SELECT COALESCE(SUM(CASE WHEN v.is_like THEN 1 ELSE 0 END), 0) "
        "   FROM article_votes v JOIN articles a ON a.id = v.article_id "
        "   WHERE a.user_id = $1) AS upvote_count",
        [this, db, userId, cb](const drogon::orm::Result &result) {
            if (result.empty()) { cb(true, ""); return; }

            auto postCount = result[0]["post_count"].as<int>();
            auto articleCount = result[0]["article_count"].as<int>();
            auto snippetCount = result[0]["snippet_count"].as<int>();
            auto upvoteCount = result[0]["upvote_count"].as<int>();

            auto remaining = std::make_shared<int>(0);

            auto checkAward = [this, db, userId, remaining, cb](const std::string &name, bool condition) {
                if (condition) {
                    (*remaining)++;
                    awardAchievement(db, userId, name,
                        [remaining, cb](bool, const std::string &) {
                            (*remaining)--;
                            if (*remaining == 0) cb(true, "");
                        });
                }
            };

            checkAward("first_post", postCount >= 1);
            checkAward("hundred_posts", postCount >= 100);
            checkAward("helpful", upvoteCount >= 50);
            checkAward("first_article", articleCount >= 1);
            checkAward("first_snippet", snippetCount >= 1);

            if (*remaining == 0) cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId);
}

void SocialService::calculateReputation(const DbClientPtr &db, int userId,
                                         std::function<void(const ReputationDto &)> cb) {
    db->execSqlAsync(
        "SELECT "
        "  (SELECT COUNT(*) FROM forum_posts WHERE user_id = $1)::int AS post_count, "
        "  (SELECT COALESCE(SUM(CASE WHEN v.is_like THEN 1 ELSE 0 END), 0) "
        "   FROM article_votes v JOIN articles a ON a.id = v.article_id "
        "   WHERE a.user_id = $1)::int AS upvote_count, "
        "  (SELECT COUNT(*) FROM user_achievements WHERE user_id = $1)::int AS achievement_count",
        [cb](const drogon::orm::Result &result) {
            ReputationDto rep;
            if (result.empty()) {
                rep = {0, 0, 0, 0};
            } else {
                rep.postCount = result[0]["post_count"].as<int>();
                rep.upvoteCount = result[0]["upvote_count"].as<int>();
                rep.achievementCount = result[0]["achievement_count"].as<int>();
                rep.total = rep.postCount * 1 + rep.upvoteCount * 5 + rep.achievementCount * 10;
            }
            cb(rep);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({0, 0, 0, 0});
        },
        userId);
}

std::vector<std::string> SocialService::parseMentions(const std::string &text) {
    std::vector<std::string> mentions;
    std::regex mentionRegex("@(\\w+)");
    auto begin = std::sregex_iterator(text.begin(), text.end(), mentionRegex);
    auto end = std::sregex_iterator();
    for (auto it = begin; it != end; ++it) {
        mentions.push_back((*it)[1].str());
    }
    return mentions;
}

} // namespace pyracms
