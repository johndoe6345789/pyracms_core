#pragma once

#include <cctype>
#include <cstdlib>
#include <string>

namespace pyracms {

// Input rules shared by controllers. Pure and unit-tested.

inline bool hasControlChars(const std::string &s) {
    for (unsigned char c : s) {
        if (c < 0x20 || c == 0x7f)
            return true;
    }
    return false;
}

// 3-32 characters of letters, digits, '_', '.', '-'.
inline bool isValidUsername(const std::string &s) {
    if (s.size() < 3 || s.size() > 32)
        return false;
    for (unsigned char c : s) {
        if (!std::isalnum(c) && c != '_' && c != '.' && c != '-')
            return false;
    }
    return true;
}

// Deliberately plain: one '@', a dotted domain, no spaces, quotes,
// angle brackets, commas or control characters (blocks header injection).
inline bool isValidEmail(const std::string &s) {
    if (s.size() < 5 || s.size() > 128)
        return false;
    auto at = s.find('@');
    if (at == std::string::npos || at == 0 || at != s.rfind('@'))
        return false;
    for (unsigned char c : s) {
        if (c <= ' ' || c == 0x7f || c == '"' || c == '<' || c == '>' ||
            c == ',' || c == ';' || c == '\' || c == '\'' || c >= 0x80)
            return false;
    }
    auto domain = s.substr(at + 1);
    auto dot = domain.rfind('.');
    return dot != std::string::npos && dot > 0 && dot + 1 < domain.size() &&
           domain.front() != '.' && domain.back() != '.';
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
