#pragma once

#include <cctype>
#include <cstdlib>
#include <string>

namespace pyracms {

// Identifier rules shared by controllers. Pure and unit-tested.

inline bool hasControlChars(const std::string &s) {
    for (unsigned char c : s) {
        if (c < 0x20 || c == 0x7f)
            return true;
    }
    return false;
}

// 8-4-4-4-12 hex (what drogon::utils::getUuid() produces).
inline bool isValidUuid(const std::string &s) {
    if (s.size() != 36)
        return false;
    for (size_t i = 0; i < s.size(); ++i) {
        bool dash = i == 8 || i == 13 || i == 18 || i == 23;
        if (dash ? s[i] != '-'
                 : !std::isxdigit(static_cast<unsigned char>(s[i])))
            return false;
    }
    return true;
}

// Whole-string non-negative int within int range; false otherwise.
inline bool parseId(const std::string &s, int &out) {
    if (s.empty() || s.size() > 9)
        return false;
    for (unsigned char c : s) {
        if (!std::isdigit(c))
            return false;
    }
    out = std::atoi(s.c_str());
    return true;
}

// Tolerant name for URL slugs / resource keys: [A-Za-z0-9._-]{1,max}.
inline bool isSafeKey(const std::string &s, size_t max = 128) {
    if (s.empty() || s.size() > max)
        return false;
    for (unsigned char c : s) {
        if (!std::isalnum(c) && c != '_' && c != '.' && c != '-')
            return false;
    }
    return true;
}

} // namespace pyracms
