#include "filters/FeatureCache.h"

namespace pyracms {

FeatureCache &FeatureCache::instance() {
    static FeatureCache c;
    return c;
}

bool FeatureCache::get(int tenant, const std::string &feature, bool &enabled,
                       Clock::time_point now) {
    std::lock_guard<std::mutex> lock(mu_);
    auto it = map_.find({tenant, feature});
    if (it == map_.end() || now - it->second.at >= kTtl)
        return false;
    enabled = it->second.enabled;
    return true;
}

void FeatureCache::put(int tenant, const std::string &feature, bool enabled,
                       Clock::time_point now) {
    std::lock_guard<std::mutex> lock(mu_);
    map_[{tenant, feature}] = {enabled, now};
}

void FeatureCache::clear() {
    std::lock_guard<std::mutex> lock(mu_);
    map_.clear();
}

} // namespace pyracms
