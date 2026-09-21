#include "storage/BlobStream.h"

#include <algorithm>
#include <chrono>
#include <cstring>

namespace pyracms {

static const auto kWait = std::chrono::seconds(120);

bool BlobStream::push(std::string chunk) {
    std::unique_lock<std::mutex> lock(mu_);
    if (!cv_.wait_for(lock, kWait, [&] { return closed_ || bytes_ < cap_; }))
        closed_ = true; // the reader stalled: give up on it
    if (closed_)
        return false;
    bytes_ += chunk.size();
    q_.push_back(std::move(chunk));
    cv_.notify_all();
    return true;
}

void BlobStream::finish(bool ok) {
    std::lock_guard<std::mutex> lock(mu_);
    done_ = true;
    if (!ok)
        closed_ = true; // a failed fetch must not look like a full file
    cv_.notify_all();
}

size_t BlobStream::read(char *out, size_t n) {
    std::unique_lock<std::mutex> lock(mu_);
    if (!cv_.wait_for(lock, kWait,
                      [&] { return !q_.empty() || done_ || closed_; }))
        return 0;
    if (q_.empty() || (closed_ && done_))
        return 0;
    auto &head = q_.front();
    size_t take = std::min(n, head.size() - front_);
    std::memcpy(out, head.data() + front_, take);
    front_ += take;
    bytes_ -= take;
    if (front_ == head.size()) {
        q_.pop_front();
        front_ = 0;
    }
    cv_.notify_all();
    return take;
}

void BlobStream::close() {
    std::lock_guard<std::mutex> lock(mu_);
    closed_ = true;
    q_.clear();
    bytes_ = front_ = 0;
    cv_.notify_all();
}

} // namespace pyracms
