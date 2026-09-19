#pragma once

#include "storage/BlobStorage.h"

#include <memory>
#include <string>

namespace pyracms {

// The stores this process can reach and which one takes new uploads.
// Every file row records the store it was written to, so files written
// under one backend stay readable after STORAGE_BACKEND changes.
class BlobRegistry {
  public:
    // Store for new uploads (STORAGE_BACKEND).
    static std::shared_ptr<BlobStorage> active();
    // Store a file row names ("local" | "s3"); null when not configured.
    static std::shared_ptr<BlobStorage> named(const std::string &name);
    // Replace the stores (tests). `s3` may be null.
    static void configure(std::shared_ptr<BlobStorage> local,
                          std::shared_ptr<BlobStorage> s3,
                          const std::string &activeName);
    // Forget everything and read the environment again.
    static void reset();
};

} // namespace pyracms
