#include "storage/StorageConfig.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(StorageConfigS3, RegionAndPresignRules) {
    StorageConfig c;
    c.backend = "s3";
    c.endpoint = "http://objectstore:9000";
    EXPECT_EQ(c.region, "us-east-1");
    EXPECT_EQ(storageConfigError(c, false), "");
    c.region = "";
    EXPECT_NE(storageConfigError(c, false).find("S3_REGION"),
              std::string::npos);
    c.region = "eu-west-1";
    c.presignedDownloads = true;
    EXPECT_NE(storageConfigError(c, false).find("S3_PUBLIC_ENDPOINT"),
              std::string::npos);
    c.publicEndpoint = "https://files.example.com";
    EXPECT_EQ(storageConfigError(c, false), "");
}

TEST(StorageConfigS3, EnvDefaults) {
    unsetenv("S3_REGION");
    unsetenv("S3_PRESIGNED_DOWNLOADS");
    EXPECT_EQ(storageConfigFromEnv().region, "us-east-1");
    EXPECT_FALSE(storageConfigFromEnv().presignedDownloads);
    setenv("S3_REGION", "eu-west-1", 1);
    setenv("S3_PRESIGNED_DOWNLOADS", "1", 1);
    EXPECT_EQ(storageConfigFromEnv().region, "eu-west-1");
    EXPECT_TRUE(storageConfigFromEnv().presignedDownloads);
    unsetenv("S3_REGION");
    unsetenv("S3_PRESIGNED_DOWNLOADS");
}
