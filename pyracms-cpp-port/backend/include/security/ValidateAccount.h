#pragma once

#include "security/ValidateId.h"

#include <cctype>
#include <string>

namespace pyracms {

// Account field rules. Pure and unit-tested.

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
            c == ',' || c == ';' || c == '\\' || c == '\'' || c >= 0x80)
            return false;
    }
    auto domain = s.substr(at + 1);
    auto dot = domain.rfind('.');
    return dot != std::string::npos && dot > 0 && dot + 1 < domain.size() &&
           domain.front() != '.' && domain.back() != '.';
}

} // namespace pyracms
