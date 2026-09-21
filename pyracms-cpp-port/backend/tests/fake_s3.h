#pragma once

#include <drogon/drogon.h>
#include <map>
#include <string>

// An in-process stand-in for the object-store dialect PyraCMS talks to
// (path-style /{bucket}/{key}, every request AWS Signature V4 signed),
// served by the test app itself under kFakeS3Prefix.
namespace harness {

constexpr const char *kFakeS3Prefix = "/fakes3";
constexpr const char *kFakeS3Access = "test-access";
constexpr const char *kFakeS3Secret = "test-secret";

struct FakeS3 {
    // Before the app starts.
    static void install(drogon::HttpAppFramework &app);
    static void clear();
    // Objects keyed "bucket/key".
    static std::map<std::string, std::string> objects();
    static void plant(const std::string &bucketKey, const std::string &body);
    static int bucketsCreated();
    static int openUploads(); // multipart uploads not completed/aborted
    // The next request is answered with this HTTP status (0 = normal).
    static void failNext(int status);
};

} // namespace harness
