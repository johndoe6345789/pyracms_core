#include "security/RateLimiter.h"

#include <algorithm>

namespace pyracms {

bool RateLimiter::locked(const std::string &key, int maxFails,
                         int windowSec) {
    std::lock_guard<std::mutex> lock(mu_);
    auto it = fails_.find(key);
    if (it == fails_.end())
        return false;
    auto &v = it->second;
    double cutoff = now() - windowSec;
    v.erase(std::remove_if(v.begin(), v.end(),
                           [&](double t) { return t <= cutoff; }),
            v.end());
    return static_cast<int>(v.size()) >= maxFails;
}

void RateLimiter::fail(const std::string &key) {
    std::lock_guard<std::mutex> lock(mu_);
    fails_[key].push_back(now());
}

void RateLimiter::succeed(const std::string &key) {
    std::lock_guard<std::mutex> lock(mu_);
    fails_.erase(key);
}

} // namespace pyracms
