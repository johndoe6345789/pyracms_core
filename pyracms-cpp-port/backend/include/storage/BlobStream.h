#pragma once

#include <condition_variable>
#include <cstddef>
#include <deque>
#include <mutex>
#include <string>

namespace pyracms {

// Bounded hand-over of an object's bytes from a fetching thread to the
// thread that answers the client, so a big download is never held in memory
// whole: `push` blocks while `cap` bytes are waiting (which also slows the
// fetch down to the client's pace), `read` blocks while nothing is.
class BlobStream {
  public:
    explicit BlobStream(size_t cap = 8u << 20) : cap_(cap) {}
    // Producer. False once the reader has gone (stop fetching).
    bool push(std::string chunk);
    void finish(bool ok);
    // Consumer. 0 = end of data, failure or timeout.
    size_t read(char *out, size_t n);
    void close(); // the reader is gone

  private:
    std::mutex mu_;
    std::condition_variable cv_;
    std::deque<std::string> q_;
    size_t cap_, bytes_{0}, front_{0};
    bool done_{false}, closed_{false};
};

} // namespace pyracms
