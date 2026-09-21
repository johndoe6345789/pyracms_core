#pragma once

#include "storage/BlobStorage.h"

#include <curl/curl.h>

namespace pyracms {

struct StreamJob {
    CURL *easy{nullptr};
    std::shared_ptr<BlobStream> out{std::make_shared<BlobStream>()};
    BlobStorage::StreamCb head;
    size_t skip{0}, length{0}, sent{0};
    bool headed{false};
    long code{0};
    void announce(BlobStatus s) {
        if (headed)
            return;
        headed = true;
        head(s, s == BlobStatus::Ok ? out : nullptr);
    }
};

// libcurl write callback: hands the body to `StreamJob::out` in slices.
size_t s3OnBody(char *p, size_t sz, size_t nm, void *u);

} // namespace pyracms
