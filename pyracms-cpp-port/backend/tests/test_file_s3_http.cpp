#include "s3_mode.h"

using namespace harness;

TEST(FileS3Http, UploadDownloadThumbnailDelete) {
    REQUIRE_SERVER();
    auto s = makeSite();
    S3Mode mode;
    auto up = upload("/api/files", s.user.token, "pic.png", kPng);
    ASSERT_EQ(up.status, 200) << up.text;
    auto uuid = up.json["uuid"].asString();
    EXPECT_EQ(storageOf(uuid), "s3");
    auto key = s3Key(uuid);
    ASSERT_EQ(FakeS3::objects().count(key), 1u);
    EXPECT_EQ(FakeS3::objects()[key], kPng);
    auto dl = get("/api/files/" + uuid);
    EXPECT_EQ(dl.status, 200);
    EXPECT_EQ(dl.text, kPng);
    EXPECT_NE(dl.headers["content-disposition"].find("pic.png"),
              std::string::npos);
    EXPECT_EQ(get("/api/files/" + uuid + "/thumbnail").text, kPng);
    FakeS3::plant(s3Key(uuid, true), "tiny");
    EXPECT_EQ(get("/api/files/" + uuid + "/thumbnail").text, "tiny");
    EXPECT_EQ(del("/api/files/" + uuid, s.user.token).status, 200);
    EXPECT_EQ(FakeS3::objects().count(key), 0u);
    EXPECT_EQ(FakeS3::objects().count(s3Key(uuid, true)), 0u);
    EXPECT_EQ(get("/api/files/" + uuid).status, 404);
}

TEST(FileS3Http, BucketCreatedOnceAndRecreatedWhenGone) {
    REQUIRE_SERVER();
    auto s = makeSite();
    S3Mode mode;
    EXPECT_EQ(upload("/api/files", s.user.token, "a.txt", "one").status, 200);
    EXPECT_EQ(upload("/api/files", s.user.token, "b.txt", "two").status, 200);
    EXPECT_EQ(FakeS3::bucketsCreated(), 1);
    FakeS3::clear(); // the store lost its bucket behind our back
    EXPECT_EQ(upload("/api/files", s.user.token, "c.txt", "3").status, 200);
    EXPECT_EQ(FakeS3::bucketsCreated(), 1);
}

TEST(FileS3Http, LocalFilesSurviveSwitchingBackends) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto old = upload("/api/files", s.user.token, "old.txt", "on-disk");
    ASSERT_EQ(old.status, 200) << old.text;
    auto oldId = old.json["uuid"].asString();
    EXPECT_EQ(storageOf(oldId), "local");
    S3Mode mode;
    EXPECT_EQ(get("/api/files/" + oldId).text, "on-disk");
    auto fresh = upload("/api/files", s.user.token, "new.txt", "in-s3");
    EXPECT_EQ(storageOf(fresh.json["uuid"].asString()), "s3");
    EXPECT_EQ(del("/api/files/" + oldId, s.user.token).status, 200);
    EXPECT_EQ(get("/api/files/" + oldId).status, 404);
}

TEST(FileS3Http, MissingKeyIs404) {
    REQUIRE_SERVER();
    auto s = makeSite();
    S3Mode mode;
    auto up = upload("/api/files", s.user.token, "gone.txt", "x");
    auto uuid = up.json["uuid"].asString();
    FakeS3::clear();
    FakeS3::plant("pyracms-test/other", "y"); // bucket exists, key does not
    EXPECT_EQ(get("/api/files/" + uuid).status, 404);
    EXPECT_EQ(get("/api/files/" + uuid + "/thumbnail").status, 404);
    EXPECT_EQ(del("/api/files/" + uuid, s.user.token).status, 200);
    EXPECT_EQ(fileRows(uuid), 0);
}
