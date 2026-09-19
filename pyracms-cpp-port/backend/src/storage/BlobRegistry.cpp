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

// Caller holds gMu. A bad configuration is refused at startup; here it just
// leaves S3 unavailable.
void init() {
    if (gState.ready)
        return;
    gState = State{};
    gState.local = std::make_shared<LocalDiskStorage>();
    auto cfg = storageConfigFromEnv();
    if (cfg.backend == "s3" && storageConfigError(cfg, false).empty()) {
        gState.s3 = std::make_shared<S3Storage>(cfg);
        gState.active = "s3";
    } else {
        gState.active = "local";
    }
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
