#pragma once

#include <cstddef>
#include <string>

namespace pyracms {

// HTTP Range / ETag rules for downloads (pure, unit-tested).

enum class RangeKind { Whole, Partial, Unsatisfiable };
struct ByteRange {
    RangeKind kind{RangeKind::Whole};
    size_t start{0};
    size_t length{0};
};

inline bool allDigits(const std::string &s) {
    if (s.empty() || s.size() > 18)
        return false;
    for (char c : s) {
        if (c < '0' || c > '9')
            return false;
    }
    return true;
}

// One "bytes=a-b" | "bytes=a-" | "bytes=-n" range against `size`.
// Malformed or multi-range headers are ignored (whole file), as RFC 9110
// allows; a range starting past the end is Unsatisfiable (416).
inline ByteRange parseRange(const std::string &h, size_t size) {
    if (h.rfind("bytes=", 0) != 0 || h.find(',') != std::string::npos)
        return {};
    auto spec = h.substr(6);
    auto dash = spec.find('-');
    if (dash == std::string::npos)
        return {};
    auto a = spec.substr(0, dash), b = spec.substr(dash + 1);
    size_t start = 0, last = 0;
    if (a.empty()) { // suffix: the final n bytes
        if (!allDigits(b))
            return {};
        size_t n = std::stoull(b);
        if (n == 0 || size == 0)
            return {RangeKind::Unsatisfiable, 0, 0};
        start = n >= size ? 0 : size - n;
        last = size - 1;
    } else {
        if (!allDigits(a) || (!b.empty() && !allDigits(b)))
            return {};
        start = std::stoull(a);
        last = b.empty() ? size - 1 : std::stoull(b);
        if (!b.empty() && last < start)
            return {};
        if (start >= size)
            return {RangeKind::Unsatisfiable, 0, 0};
        if (last >= size)
            last = size - 1;
    }
    return {RangeKind::Partial, start, last - start + 1};
}

// A resumed download continues a transfer; only fresh ones are counted.
inline bool countsAsDownload(const std::string &rangeHeader) {
    return rangeHeader.empty() || rangeHeader.rfind("bytes=0-", 0) == 0;
}

} // namespace pyracms
