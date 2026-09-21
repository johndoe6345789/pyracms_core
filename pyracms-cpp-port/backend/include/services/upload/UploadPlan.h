#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace pyracms {

// One received part; `stateHex` is the running sha256 after it.
struct PartRow {
    int no{0};
    int64_t size{0};
    std::string etag;
    std::string stateHex;
};

enum class PartAction { Store, Duplicate, OutOfOrder, TooMuch };

struct PartPlan {
    PartAction action{PartAction::Store};
    std::string prevState; // hash state to extend (Store)
    std::string etag;      // the stored etag (Duplicate)
};

// Decides what to do with part `n` (size, md5) given the parts stored in
// order 1..k. New parts must be next in line; the last part may be
// replaced; any part re-sent with identical content is a no-op, so a
// client can retry safely after a lost response.
PartPlan planPart(const std::vector<PartRow> &parts, int n, int64_t size,
                  const std::string &md5, int64_t declared);

} // namespace pyracms
