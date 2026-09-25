#include "storage/S3Storage.h"

namespace pyracms {

// Docker's overlay VIP forgets a TCP flow that idles for ~15 minutes without
// telling either end, and the kernel's keepalive only starts after 2 hours,
// so a pooled connection can be dead yet look open: every request queued on
// it then times out. Never reuse one that has been quiet for a while, and
// discard one the moment a request on it fails.
drogon::HttpClientPtr S3Storage::client() {
    constexpr auto kIdle = std::chrono::seconds(20);
    std::lock_guard<std::mutex> lock(mu_);
    auto now = std::chrono::steady_clock::now();
    if (!client_ || now - lastUse_ > kIdle)
        client_ = drogon::HttpClient::newHttpClient(ep_.origin);
    lastUse_ = now;
    return client_;
}

void S3Storage::dropClient(const drogon::HttpClientPtr &dead) {
    std::lock_guard<std::mutex> lock(mu_);
    if (client_ == dead)
        client_.reset();
}

} // namespace pyracms
