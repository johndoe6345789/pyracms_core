#pragma once

#include <string>

namespace pyracms {

// Integer query value; `dflt` when missing, malformed or out of range.
inline int queryInt(const std::string &raw, int dflt) {
    if (raw.empty() || raw.size() > 9 ||
        raw.find_first_not_of("0123456789") != std::string::npos)
        return dflt;
    return std::stoi(raw);
}

inline int clampRange(int v, int lo, int hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

} // namespace pyracms
