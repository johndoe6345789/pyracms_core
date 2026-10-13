#include "controllers/VideoJson.h"
#include "filters/FeatureRules.h"
#include "filters/OwnerRules.h"
#include "services/VideoSql.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(VideoRules, RoutesMapToVideosAndTheirFeature) {
    EXPECT_EQ(targetOf("/api/videos/7").kind, Resource::Video);
    EXPECT_EQ(targetOf("/api/videos/7/vote").key, "7");
    EXPECT_EQ(targetOf("/api/videos").kind, Resource::None);
    EXPECT_EQ(featureOfPath("/api/videos"), "videos");
    EXPECT_EQ(featureOfPath("/api/videos/3/vote"), "videos");
    EXPECT_EQ(featureOfPath("/api/videosx"), "");
    OwnedRow row{5, 2, false};
    EXPECT_TRUE(writeAllowed(Resource::Video, 1, 5, 2, row));
    EXPECT_FALSE(writeAllowed(Resource::Video, 1, 6, 2, row));
    EXPECT_FALSE(writeAllowed(Resource::Video, 1, 5, 3, row));
}

TEST(VideoRules, SearchTextIsMatchedLiterally) {
    EXPECT_EQ(likePattern("a%b_c\\"), "%a\\%b\\_c\\\\%");
    EXPECT_EQ(likePattern(""), "%%");
}

TEST(VideoRules, InputOverlaysAndValidates) {
    VideoInput in{"Old", "desc", "", 3, "public"};
    Json::Value body(Json::objectValue);
    body["visibility"] = "unlisted";
    EXPECT_EQ(applyVideoInput(body, in), "");
    EXPECT_EQ(in.title, "Old");
    EXPECT_EQ(in.visibility, "unlisted");
    EXPECT_EQ(in.durationSeconds, 3);
    body["title"] = 5;
    EXPECT_NE(applyVideoInput(body, in), "");
    body["title"] = std::string(201, 'x');
    EXPECT_NE(applyVideoInput(body, in), "");
    body["title"] = "T";
    body["description"] = std::string(5001, 'x');
    EXPECT_NE(applyVideoInput(body, in), "");
    body["description"] = "ok";
    body["thumbnailUuid"] = "not-a-uuid";
    EXPECT_NE(applyVideoInput(body, in), "");
    body["thumbnailUuid"] = "";
    body["durationSeconds"] = "long";
    EXPECT_NE(applyVideoInput(body, in), "");
    body["durationSeconds"] = 604801;
    EXPECT_NE(applyVideoInput(body, in), "");
    EXPECT_NE(applyVideoInput(Json::Value("x"), in), "");
}

TEST(VideoRules, JsonCarriesEveryField) {
    VideoDto v;
    v.id = 4;
    v.viewCount = 5000000000LL;
    v.visibility = "private";
    auto j = videoJson(v);
    EXPECT_EQ(j["id"].asInt(), 4);
    EXPECT_EQ(j["viewCount"].asInt64(), 5000000000LL);
    EXPECT_EQ(j["visibility"].asString(), "private");
    EXPECT_FALSE(j.isMember("myVote"));
    auto t = tallyJson({2, 1, "like"});
    EXPECT_EQ(t["likes"].asInt(), 2);
    EXPECT_EQ(t["myVote"].asString(), "like");
}
