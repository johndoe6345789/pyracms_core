#include "s3_mode.h"

using namespace harness;

static std::string seedFile(const Site &s) {
    auto up = upload("/api/files", s.user.token, "keep.txt", "keep");
    return up.json["uuid"].asString();
}

TEST(FileS3Errors, WrongCredentialsAre502NotLeaked) {
    REQUIRE_SERVER();
    auto s = makeSite();
    std::string uuid;
    {
        S3Mode ok;
        uuid = seedFile(s);
    }
    S3Mode bad("wrong-secret");
    auto up = upload("/api/files", s.user.token, "n.txt", "nope");
    EXPECT_EQ(up.status, 502);
    EXPECT_EQ(up.text.find("AccessDenied"), std::string::npos);
    EXPECT_EQ(up.text.find("127.0.0.1"), std::string::npos);
    EXPECT_EQ(get("/api/files/" + uuid).status, 502);
    EXPECT_EQ(del("/api/files/" + uuid, s.user.token).status, 502);
    EXPECT_EQ(fileRows(uuid), 1); // row kept so the delete can be retried
}

TEST(FileS3Errors, BackendDownIs503) {
    REQUIRE_SERVER();
    auto s = makeSite();
    std::string uuid;
    {
        S3Mode ok;
        uuid = seedFile(s);
    }
    S3Mode down(kFakeS3Secret, "http://127.0.0.1:1");
    auto up = upload("/api/files", s.user.token, "n.txt", "nope");
    EXPECT_EQ(up.status, 503);
    EXPECT_EQ(get("/api/files/" + uuid).status, 503);
    EXPECT_EQ(get("/api/files/" + uuid + "/thumbnail").status, 503);
    EXPECT_EQ(del("/api/files/" + uuid, s.user.token).status, 503);
    EXPECT_EQ(fileRows(uuid), 1);
}

TEST(FileS3Errors, StoreServerErrorIs502WithoutDetail) {
    REQUIRE_SERVER();
    auto s = makeSite();
    S3Mode mode;
    auto uuid = seedFile(s);
    FakeS3::failNext(500);
    auto dl = get("/api/files/" + uuid);
    EXPECT_EQ(dl.status, 502);
    EXPECT_EQ(dl.text.find("secret-internal-detail"), std::string::npos);
}

TEST(FileS3Errors, UnconfiguredS3RowIs503) {
    REQUIRE_SERVER();
    auto s = makeSite();
    std::string uuid;
    {
        S3Mode ok;
        uuid = seedFile(s);
    }
    pyracms::BlobRegistry::configure(
        std::make_shared<pyracms::LocalDiskStorage>(), nullptr, "local");
    EXPECT_EQ(get("/api/files/" + uuid).status, 503);
    pyracms::BlobRegistry::reset();
}
