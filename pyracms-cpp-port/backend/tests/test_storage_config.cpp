#include "s3_mode.h"

using namespace pyracms;

TEST(StorageConfig, ParsesEndpoint) {
    auto e = parseS3Endpoint("http://objectstore:9000/base//");
    EXPECT_TRUE(e.valid);
    EXPECT_EQ(e.origin, "http://objectstore:9000");
    EXPECT_EQ(e.prefix, "/base");
    EXPECT_EQ(parseS3Endpoint("http://h:1").prefix, "");
    EXPECT_FALSE(parseS3Endpoint("ftp://h").valid);
    EXPECT_FALSE(parseS3Endpoint("h:9000").valid);
    EXPECT_FALSE(parseS3Endpoint("http://").valid);
}

TEST(StorageConfig, ValidatesBackend) {
    StorageConfig c;
    EXPECT_EQ(storageConfigError(c, true), "");
    c.backend = "ftp";
    EXPECT_NE(storageConfigError(c, false), "");
    c.backend = "s3";
    EXPECT_NE(storageConfigError(c, false).find("S3_ENDPOINT"),
              std::string::npos);
    c.endpoint = "http://objectstore:9000";
    EXPECT_EQ(storageConfigError(c, false), "");
    EXPECT_NE(storageConfigError(c, true).find("S3_ACCESS_KEY"),
              std::string::npos);
    c.accessKey = "a";
    c.secretKey = "b";
    EXPECT_EQ(storageConfigError(c, true), "");
    c.bucket = "Bad_Bucket";
    EXPECT_NE(storageConfigError(c, true).find("S3_BUCKET"),
              std::string::npos);
}

TEST(StorageConfig, ReadsEnvironment) {
    setenv("STORAGE_BACKEND", "s3", 1);
    setenv("S3_ENDPOINT", "http://objectstore:9000", 1);
    setenv("S3_ACCESS_KEY", "ak", 1);
    setenv("S3_TIMEOUT_S", "7", 1);
    auto c = storageConfigFromEnv();
    EXPECT_EQ(c.backend, "s3");
    EXPECT_EQ(c.bucket, "pyracms");
    EXPECT_EQ(c.accessKey, "ak");
    EXPECT_EQ(c.timeoutS, 7);
    EXPECT_EQ(startupStorageError(), ""); // dev: creds optional
    BlobRegistry::reset();
    EXPECT_STREQ(BlobRegistry::active()->name(), "s3");
    setenv("STORAGE_BACKEND", "local", 1); // s3 stays readable, not active
    BlobRegistry::reset();
    EXPECT_STREQ(BlobRegistry::active()->name(), "local");
    ASSERT_NE(BlobRegistry::named("s3"), nullptr);
    for (auto v : {"STORAGE_BACKEND", "S3_ENDPOINT", "S3_ACCESS_KEY",
                   "S3_TIMEOUT_S"})
        unsetenv(v);
    BlobRegistry::reset();
    EXPECT_STREQ(BlobRegistry::active()->name(), "local");
    EXPECT_EQ(BlobRegistry::named("s3"), nullptr);
    EXPECT_EQ(BlobRegistry::named("nope"), nullptr);
}
