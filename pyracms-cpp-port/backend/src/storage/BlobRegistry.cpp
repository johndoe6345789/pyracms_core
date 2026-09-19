#include "storage/BlobRegistry.h"
#include "storage/LocalDiskStorage.h"
#include "storage/S3Storage.h"

#include <mutex>

namespace pyracms {

namespace {

struct State {
    std::shared_ptr<BlobStorage> local;
    std::shared_ptr<BlobStorage> s3;
    std::string active;
    bool ready{false};
};

std::mutex gMu;
State gState;

// Caller holds gMu. S3 is reachable whenever an endpoint is configured, even
// while new uploads go to disk, so files already in S3 stay readable. A bad
// configuration is refused at startup; here it just leaves S3 unavailable.
void init() {
    if (gState.ready)
        return;
    gState = State{};
    gState.local = std::make_shared<LocalDiskStorage>();
    auto cfg = storageConfigFromEnv();
    auto asS3 = cfg;
    asS3.backend = "s3";
    if (storageConfigError(asS3, false).empty())
        gState.s3 = std::make_shared<S3Storage>(cfg);
    gState.active = cfg.backend == "s3" && gState.s3 ? "s3" : "local";
    gState.ready = true;
}

} // namespace

std::shared_ptr<BlobStorage> BlobRegistry::active() {
    std::lock_guard<std::mutex> lock(gMu);
    init();
    return gState.active == "s3" ? gState.s3 : gState.local;
}

std::shared_ptr<BlobStorage> BlobRegistry::named(const std::string &name) {
    std::lock_guard<std::mutex> lock(gMu);
    init();
    if (name == "local")
        return gState.local;
    return name == "s3" ? gState.s3 : nullptr;
}

void BlobRegistry::configure(std::shared_ptr<BlobStorage> local,
                             std::shared_ptr<BlobStorage> s3,
                             const std::string &activeName) {
    std::lock_guard<std::mutex> lock(gMu);
    gState = State{std::move(local), std::move(s3), activeName, true};
}

void BlobRegistry::reset() {
    std::lock_guard<std::mutex> lock(gMu);
    gState = State{};
}

} // namespace pyracms
