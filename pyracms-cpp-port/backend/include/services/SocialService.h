#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct ActivityItem {
    std::string type;   // article, forum_post, snippet
    int id;
    std::string title;
    std::string summary;
    std::string createdAt;
};

struct AchievementDto {
    int id;
    std::string name;
    std::string displayName;
    std::string description;
    std::string icon;
    bool earned;
    std::string earnedAt;
};

struct UserFollowDto {
    int userId;
    std::string username;
    std::string avatarUrl;
    std::string createdAt;
};

struct ReputationDto {
    int total;
    int postCount;
    int upvoteCount;
    int achievementCount;
};

class SocialService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool, const std::string &)>;

    void followUser(const DbClientPtr &db, int followerId, int followedId,
                    BoolCallback cb);

    void unfollowUser(const DbClientPtr &db, int followerId, int followedId,
                      BoolCallback cb);

    void isFollowing(const DbClientPtr &db, int followerId, int followedId,
                     std::function<void(bool)> cb);

    void getFollowers(const DbClientPtr &db, int userId, int limit, int offset,
                      std::function<void(const std::vector<UserFollowDto> &, int total)> cb);

    void getFollowing(const DbClientPtr &db, int userId, int limit, int offset,
                      std::function<void(const std::vector<UserFollowDto> &, int total)> cb);

    void getActivityFeed(const DbClientPtr &db, int userId, int limit, int offset,
                         std::function<void(const std::vector<ActivityItem> &)> cb);

    void getUserAchievements(const DbClientPtr &db, int userId,
                             std::function<void(const std::vector<AchievementDto> &)> cb);

    void awardAchievement(const DbClientPtr &db, int userId,
                          const std::string &achievementName,
                          BoolCallback cb);

    void checkAndAwardAchievements(const DbClientPtr &db, int userId,
                                    BoolCallback cb);

    void calculateReputation(const DbClientPtr &db, int userId,
                             std::function<void(const ReputationDto &)> cb);

    std::vector<std::string> parseMentions(const std::string &text);
};

} // namespace pyracms
