#pragma once

#include "security/ValidateId.h"

#include <string>

namespace pyracms {

// Content rules (names, text, links). Pure and unit-tested.

// A path-safe resource name: printable, no '/', '\', '?', '#', '%'.
inline bool isSafeName(const std::string &s, size_t max = 200) {
    if (s.empty() || s.size() > max || hasControlChars(s))
        return false;
    return s.find_first_of("/?#%\\") == std::string::npos;
}

inline std::string lowerAscii(std::string s) {
    for (auto &c : s)
        c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    return s;
}

inline bool isKnownRenderer(const std::string &r) {
    auto l = lowerAscii(r);
    return l == "markdown" || l == "html" || l == "bbcode" ||
           l == "restructuredtext";
}

// Free text with an upper bound (bytes); control characters other than
// tab/newline/CR are refused.
inline bool isBoundedText(const std::string &s, size_t max) {
    if (s.size() > max)
        return false;
    for (unsigned char c : s) {
        if (c < 0x20 && c != 0x09 && c != 0x0a && c != 0x0d)
            return false;
    }
    return true;
}

// Setting names that look like credentials stay hidden from the public.
inline bool isSensitiveSettingName(const std::string &name) {
    auto l = lowerAscii(name);
    for (const char *w : {"secret", "password", "passwd", "token", "apikey",
                          "api_key", "credential", "smtp"}) {
        if (l.find(w) != std::string::npos)
            return true;
    }
    return l.size() >= 3 && l.compare(l.size() - 3, 3, "key") == 0;
}

// A link that is safe to render as href: empty, a site-relative path
// ("/x", never "//host"), http(s) or mailto. Blocks javascript:/data: URLs.
inline bool isSafeLinkUrl(const std::string &u) {
    if (u.empty())
        return true;
    if (u.size() > 2048 || hasControlChars(u) || u.find(' ') != u.npos)
        return false;
    if (u[0] == '/')
        return u.size() == 1 || (u[1] != '/' && u[1] != '\\');
    if (u.find(':') == std::string::npos) // relative path such as "about"
        return true;
    auto l = lowerAscii(u);
    return l.rfind("http://", 0) == 0 || l.rfind("https://", 0) == 0 ||
           l.rfind("mailto:", 0) == 0;
}

} // namespace pyracms
