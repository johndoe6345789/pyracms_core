#pragma once

#include "fake_s3.h"
#include "http_accounts.h"
#include "storage/BlobRegistry.h"
#include "storage/LocalDiskStorage.h"
#include "storage/S3Storage.h"

namespace harness {

// Points the app's file storage at the fake object store for one test.
struct S3Mode {
    explicit S3Mode(const std::string &secret = kFakeS3Secret,
                    const std::string &endpoint =
                        "http://127.0.0.1:3299/fakes3") {
        FakeS3::clear();
        pyracms::StorageConfig c;
        c.backend = "s3";
        c.endpoint = endpoint;
        c.bucket = "pyracms-test";
        c.accessKey = kFakeS3Access;
        c.secretKey = secret;
        c.timeoutS = 5;
        pyracms::BlobRegistry::configure(
            std::make_shared<pyracms::LocalDiskStorage>(),
            std::make_shared<pyracms::S3Storage>(c), "s3");
    }
    ~S3Mode() { pyracms::BlobRegistry::reset(); }
};

inline const std::string kPng =
    std::string("\x89PNG\r\n\x1a\n", 8) + "pixels-\x01\x02\xff-end";

// "bucket/key" the fake store holds for an uploaded file.
inline std::string s3Key(const std::string &uuid, bool thumb = false) {
    auto r = testDb()->execSqlSync(
        "SELECT COALESCE(tenant_id, 0) AS t FROM files "
        "WHERE uuid = $1", uuid);
    return "pyracms-test/tenant-" + std::to_string(r[0]["t"].as<int>()) +
           (thumb ? "-thumb-" : "-") + uuid;
}

inline std::string storageOf(const std::string &uuid) {
    return testDb()
        ->execSqlSync("SELECT storage FROM files WHERE uuid = $1", uuid)[0]
                     ["storage"].as<std::string>();
}

inline int fileRows(const std::string &uuid) {
    return static_cast<int>(
        testDb()->execSqlSync("SELECT 1 FROM files WHERE uuid = $1", uuid)
            .size());
}

} // namespace harness
