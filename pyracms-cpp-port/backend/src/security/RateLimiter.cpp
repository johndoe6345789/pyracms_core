#include "security/RateLimiter.h"

#include <algorithm>
#include <atomic>
#include <chrono>

namespace pyracms {

static std::atomic<bool> gEnabled{true};
static const double kKeepSec = 3600; // longest window any caller uses
static const size_t kMaxKeys = 50000;

RateLimiter::RateLimiter(Clock clock) : clock_(std::move(clock)) {
    if (!clock_) {
        clock_ = [] {
            using namespace std::chrono;
            return duration<double>(steady_clock::now().time_since_epoch())
                .count();
        };
    }
}

RateLimiter &RateLimiter::instance() {
    static RateLimiter limiter;
    return limiter;
}

void RateLimiter::setEnabled(bool on) { gEnabled = on; }
bool RateLimiter::enabled() { return gEnabled; }
double RateLimiter::now() { return clock_(); }

static void dropOld(std::vector<double> &v, double cutoff) {
    v.erase(std::remove_if(v.begin(), v.end(),
                           [&](double t) { return t <= cutoff; }),
            v.end());
}

// Forget idle keys so the maps cannot grow without bound.
void RateLimiter::prune(double t) {
    if (t - lastPrune_ < 60 && hits_.size() + fails_.size() < kMaxKeys)
        return;
    lastPrune_ = t;
    for (auto *m : {&hits_, &fails_}) {
        for (auto it = m->begin(); it != m->end();) {
            dropOld(it->second, t - kKeepSec);
            it = it->second.empty() ? m->erase(it) : std::next(it);
        }
    }
}

bool RateLimiter::allow(const std::string &key, int max, int windowSec,
                        int *retryAfter) {
    std::lock_guard<std::mutex> lock(mu_);
    double t = now();
    prune(t);
    auto &v = hits_[key];
    dropOld(v, t - windowSec);
    if (static_cast<int>(v.size()) >= max) {
        if (retryAfter)
            *retryAfter = static_cast<int>(v.front() + windowSec - t) + 1;
        return false;
    }
    v.push_back(t);
    return true;
}

size_t RateLimiter::size() {
    std::lock_guard<std::mutex> lock(mu_);
    return hits_.size() + fails_.size();
}

} // namespace pyracms
