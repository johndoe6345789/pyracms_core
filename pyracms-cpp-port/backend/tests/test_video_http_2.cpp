#include "video_fixtures.h"

using namespace harness;
using namespace vfx;

TEST(VideoHttp, VisibilityDecidesWhoSeesWhat) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto pub = mkVideo(s, s.user, J({{"title", "Pub"}}));
    auto unl = mkVideo(s, s.user,
                       J({{"title", "Unl"}, {"visibility", "unlisted"}}));
    auto prv = mkVideo(s, s.user,
                       J({{"title", "Prv"}, {"visibility", "private"}}));
    ASSERT_FALSE(prv.empty());
    EXPECT_EQ(get(videoUrl(s, unl)).status, 200);
    EXPECT_EQ(get(videoUrl(s, prv)).status, 404);
    EXPECT_EQ(get(videoUrl(s, prv), s.admin.token).status, 404);
    EXPECT_EQ(get(videoUrl(s, prv), s.user.token).status, 200);
    EXPECT_EQ(get(listUrl(s)).json["total"].asInt(), 1);
    auto mine = listUrl(s, "&user_id=" + std::to_string(s.user.id));
    EXPECT_EQ(get(mine, s.user.token).json["total"].asInt(), 3);
    EXPECT_EQ(get(mine, s.admin.token).json["total"].asInt(), 1);
    EXPECT_EQ(post(videoUrl(s, prv, "/vote"), J({{"isLike", true}}),
                   s.admin.token).status, 404);
    // Another site never sees them
    auto t = makeSite();
    EXPECT_EQ(get("/api/videos/" + pub + "?tenant_id=" +
                  std::to_string(t.id)).status, 404);
    EXPECT_EQ(get("/api/videos").status, 400);
}

TEST(VideoHttp, ListSortsSearchesAndPages) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto a = mkVideo(s, s.user, J({{"title", "Cats 100%"}}));
    auto b = mkVideo(s, s.admin, J({{"title", "Dogs"},
                                    {"description", "about cats"}}));
    get(videoUrl(s, a));
    get(videoUrl(s, a));
    auto l = get(listUrl(s));
    ASSERT_EQ(l.json["items"].size(), 2u);
    EXPECT_EQ(l.json["items"][0]["id"].asString(), b);
    l = get(listUrl(s, "&sort=popular"));
    EXPECT_EQ(l.json["items"][0]["id"].asString(), a);
    EXPECT_EQ(l.json["items"][0]["viewCount"].asInt(), 2);
    EXPECT_EQ(get(listUrl(s, "&q=CATS")).json["total"].asInt(), 2);
    EXPECT_EQ(get(listUrl(s, "&q=0_")).json["total"].asInt(), 0);
    l = get(listUrl(s, "&limit=1&offset=1"));
    EXPECT_EQ(l.json["total"].asInt(), 2);
    EXPECT_EQ(l.json["items"][0]["id"].asString(), a);
    EXPECT_EQ(get(listUrl(s, "&q=" + std::string(101, 'x'))).status, 400);
}

TEST(VideoHttp, LikesToggleAndCount) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto id = mkVideo(s, s.user);
    auto v = videoUrl(s, id, "/vote");
    EXPECT_EQ(post(v, J({{"isLike", "yes"}}), s.admin.token).status, 400);
    EXPECT_EQ(post(v, A({"x"}), s.admin.token).status, 400);
    EXPECT_EQ(post(v, J({{"isLike", true}}), "").status, 401);
    auto r = post(v, J({{"isLike", true}}), s.admin.token);
    ASSERT_EQ(r.status, 200) << r.text;
    EXPECT_EQ(r.json["likes"].asInt(), 1);
    EXPECT_EQ(r.json["myVote"].asString(), "like");
    r = post(v, J({{"isLike", false}}), s.admin.token);
    EXPECT_EQ(r.json["likes"].asInt(), 0);
    EXPECT_EQ(r.json["dislikes"].asInt(), 1);
    EXPECT_EQ(get(videoUrl(s, id), s.admin.token).json["myVote"].asString(),
              "dislike");
    r = del(v, s.admin.token);
    EXPECT_EQ(r.json["dislikes"].asInt(), 0);
    EXPECT_EQ(r.json["myVote"].asString(), "");
    EXPECT_EQ(del(videoUrl(s, "999999", "/vote"), s.admin.token).status,
              404);
}
