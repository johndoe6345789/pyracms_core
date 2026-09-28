#include "video_fixtures.h"

using namespace harness;
using namespace vfx;

TEST(VideoHttp, UploadWatchEditDelete) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto thumb = mkFile(s.user, s.id, "image/png");
    auto id = mkVideo(s, s.user,
                      J({{"title", "My clip"}, {"description", "d"},
                         {"thumbnailUuid", thumb},
                         {"durationSeconds", 61.6}}));
    ASSERT_FALSE(id.empty());
    auto w = get(videoUrl(s, id), s.admin.token);
    ASSERT_EQ(w.status, 200) << w.text;
    EXPECT_EQ(w.json["title"].asString(), "My clip");
    EXPECT_EQ(w.json["username"].asString(), s.user.name);
    EXPECT_EQ(w.json["thumbnailUuid"].asString(), thumb);
    EXPECT_EQ(w.json["durationSeconds"].asInt(), 62);
    EXPECT_EQ(w.json["viewCount"].asInt(), 1);
    EXPECT_EQ(w.json["visibility"].asString(), "public");
    EXPECT_EQ(get(videoUrl(s, id)).json["viewCount"].asInt(), 2);
    // Only what is sent changes
    ASSERT_EQ(put(videoUrl(s, id), J({{"title", "Renamed"}}), s.user.token)
                  .status, 200);
    w = get(videoUrl(s, id));
    EXPECT_EQ(w.json["title"].asString(), "Renamed");
    EXPECT_EQ(w.json["description"].asString(), "d");
    EXPECT_EQ(put(videoUrl(s, id), J({{"title", ""}}), s.user.token).status,
              400);
    EXPECT_EQ(put(videoUrl(s, id), J({{"visibility", "secret"}}),
                  s.user.token).status, 400);
    auto other = signup(s.slug);
    EXPECT_EQ(put(videoUrl(s, id), J({{"title", "x"}}), other.token).status,
              403);
    EXPECT_EQ(del(videoUrl(s, id), other.token).status, 403);
    post("/api/comments/video/" + id, J({{"body", "nice"}}), other.token);
    EXPECT_EQ(del(videoUrl(s, id), s.user.token).status, 200);
    EXPECT_EQ(get(videoUrl(s, id)).status, 404);
    EXPECT_EQ(get("/api/comments/video/" + id).json.size(), 0u);
}

TEST(VideoHttp, CreateChecksTheFile) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto u = s.user.token;
    auto body = [&](const std::string &file) {
        return J({{"title", "T"}, {"tenantId", s.id}, {"fileUuid", file}});
    };
    EXPECT_EQ(post("/api/videos", J({{"title", "T"}}), u).status, 400);
    EXPECT_EQ(post("/api/videos?tenant_id=" + std::to_string(s.id),
                   A({"x"}), u).status, 400);
    EXPECT_EQ(post("/api/videos", body("nope"), u).status, 400);
    // not a video, someone else's, another site's
    EXPECT_EQ(post("/api/videos", body(mkFile(s.user, s.id, "image/png")), u)
                  .status, 400);
    EXPECT_EQ(post("/api/videos", body(mkFile(s.admin, s.id)), u).status,
              400);
    auto t = makeSite();
    EXPECT_EQ(post("/api/videos", body(mkFile(s.user, t.id)), u).status, 400);
    auto b = body(mkFile(s.user, s.id, "video/webm"));
    b["title"] = "";
    EXPECT_EQ(post("/api/videos", b, u).status, 400);
    b["title"] = "ok";
    b["thumbnailUuid"] = mkFile(s.user, t.id, "image/png");
    EXPECT_EQ(post("/api/videos", b, u).status, 400);
    b["thumbnailUuid"] = "";
    b["durationSeconds"] = -1;
    EXPECT_EQ(post("/api/videos", b, u).status, 400);
    b["durationSeconds"] = 5;
    EXPECT_EQ(post("/api/videos", b, u).status, 201);
    EXPECT_EQ(post("/api/videos", b, "").status, 401);
}
