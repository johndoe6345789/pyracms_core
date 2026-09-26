#pragma once

#include <cctype>
#include <string>

namespace pyracms {

// A Material icon name as the menu stores it: "" (no icon) or up to 64
// letters/digits ("TrainOutlined"). Nothing else ever reaches the page.
inline bool isSafeIconName(const std::string &s) {
    if (s.size() > 64)
        return false;
    for (unsigned char c : s)
        if (!std::isalnum(c))
            return false;
    return true;
}

} // namespace pyracms
