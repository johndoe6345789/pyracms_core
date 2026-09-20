#pragma once

#include <chrono>
#include <map>
#include <mutex>
#include <string>
#include <utility>

namespace pyracms {

// Tiny TTL cache of (tenant, feature) -> enabled, so the gate does not hit
// the database on every request. Cleared whenever a setting is written.
class FeatureCache {
  public:
    using Clock = std::chrono::steady_clock;
    static constexpr std::chrono::seconds kTtl{30};

    static FeatureCache &instance();

    bool get(int tenant, const std::string &feature, bool &enabled,
             Clock::time_point now = Clock::now());
    void put(int tenant, const std::string &feature, bool enabled,
             Clock::time_point now = Clock::now());
    void clear();

  private:
    using Key = std::pair<int, std::string>;
    struct Entry {
        bool enabled;
        Clock::time_point at;
    };
    std::mutex mu_;
    std::map<Key, Entry> map_;
};

} // namespace pyracms
