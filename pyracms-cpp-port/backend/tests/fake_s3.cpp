#include "fake_s3.h"
#include "fake_s3_state.h"

namespace harness {

using namespace fake;

void FakeS3::install(drogon::HttpAppFramework &app) {
    app.registerSyncAdvice(
        [](const drogon::HttpRequestPtr &req) -> drogon::HttpResponsePtr {
            if (req->path().rfind(std::string(kFakeS3Prefix) + "/", 0) != 0)
                return nullptr;
            return handle(req);
        });
}

void FakeS3::clear() {
    std::lock_guard<std::mutex> lock(mu);
    buckets.clear();
    fake::objects.clear();
    uploads.clear();
    created = failStatus = 0;
}

std::map<std::string, std::string> FakeS3::objects() {
    std::lock_guard<std::mutex> lock(mu);
    return fake::objects;
}

void FakeS3::plant(const std::string &bucketKey, const std::string &body) {
    std::lock_guard<std::mutex> lock(mu);
    buckets.insert(bucketKey.substr(0, bucketKey.find('/')));
    fake::objects[bucketKey] = body;
}

int FakeS3::bucketsCreated() {
    std::lock_guard<std::mutex> lock(mu);
    return created;
}

int FakeS3::openUploads() {
    std::lock_guard<std::mutex> lock(mu);
    return static_cast<int>(uploads.size());
}

void FakeS3::failNext(int status) {
    std::lock_guard<std::mutex> lock(mu);
    failStatus = status;
}

} // namespace harness
