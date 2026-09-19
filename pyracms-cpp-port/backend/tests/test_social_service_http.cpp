#include "http_accounts.h"
#include "services/SocialService.h"

using namespace harness;
using namespace pyracms;

// Author with an article, a forum post and a snippet in one tenant.
static Acct seedAuthor(const Site &s) {
    auto name = uniq("au");
    post("/api/articles", J({{"name", name}, {"displayName", "A"},
         {"content", "c"}, {"tenant_id", s.id}}), s.user.token);
    post("/api/forum/categories", J({{"name", "C"}, {"tenantId", s.id}}),
         s.admin.token);
    post("/api/forum/forums", J({{"categoryId", maxId("forum_categories")},
         {"name", "F"}}), s.admin.token);
    post("/api/forum/threads", J({{"forumId", maxId("forums")},
         {"title", "T"}, {"content", "c"}, {"tenantId", s.id}}),
         s.user.token);
    post("/api/snippets", J({{"title", "S"}, {"code", "x"},
         {"tenant_id", s.id}}), s.user.token);
    return s.user;
}

TEST(SocialService, AchievementsActivityAndReputation) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = seedAuthor(s);
    auto db = testDb();
    SocialService svc;
    auto ach = awaitValue<std::vector<AchievementDto>>(
        [&](auto cb) { svc.getUserAchievements(db, u.id, cb); });
    EXPECT_FALSE(ach.empty());
    auto feed = awaitValue<std::vector<ActivityItem>>(
        [&](auto cb) { svc.getActivityFeed(db, u.id, 10, 0, cb); });
    EXPECT_GE(feed.size(), 3u);
    auto rep = awaitValue<ReputationDto>(
        [&](auto cb) { svc.calculateReputation(db, u.id, cb); });
    EXPECT_GE(rep.total, 1);
    EXPECT_TRUE(awaitValue<bool>([&](auto cb) {
                    svc.followUser(db, s.admin.id, u.id,
                                   [cb](bool, const std::string &) {
                                       cb(true);
                                   });
                }));
}
