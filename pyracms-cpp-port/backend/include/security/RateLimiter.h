#pragma once

#include <functional>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace pyracms {

// In-memory sliding-window limiter plus failure lockout. Per process:
// behind several instances the effective limit is multiplied.
class RateLimiter {
  public:
    using Clock = std::function<double()>; // seconds, monotonic
    explicit RateLimiter(Clock clock = nullptr);

    static RateLimiter &instance();
    // Off switch for tests only; production never calls it.
    static void setEnabled(bool on);
    static bool enabled();

    // Counts one hit for `key`; false when more than `max` hits fell in
    // the last `windowSec` seconds. `retryAfter` gets the wait in seconds.
    bool allow(const std::string &key, int max, int windowSec,
               int *retryAfter = nullptr);

    // Failure lockout: `maxFails` failures within `windowSec` lock the
    // key until the oldest of them ages out.
    bool locked(const std::string &key, int maxFails, int windowSec);
    void fail(const std::string &key);
    void succeed(const std::string &key);

    size_t size();

  private:
    double now();
    void prune(double t);
    Clock clock_;
    std::mutex mu_;
    std::unordered_map<std::string, std::vector<double>> hits_;
    std::unordered_map<std::string, std::vector<double>> fails_;
    double lastPrune_{0};
};

} // namespace pyracms
