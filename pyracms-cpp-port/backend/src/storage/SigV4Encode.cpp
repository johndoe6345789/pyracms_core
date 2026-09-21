#include "storage/SigV4.h"

#include <algorithm>
#include <cctype>
#include <vector>

namespace pyracms {

// RFC 3986 unreserved characters stay; everything else is %XX (upper).
std::string sigv4UriEncode(const std::string &s, bool keepSlash) {
    static const char *hex = "0123456789ABCDEF";
    std::string out;
    for (unsigned char c : s) {
        if (std::isalnum(c) || c == '-' || c == '_' || c == '.' ||
            c == '~' || (c == '/' && keepSlash)) {
            out += static_cast<char>(c);
        } else {
            out += '%';
            out += hex[c >> 4];
            out += hex[c & 15];
        }
    }
    return out;
}

static int hexVal(char c) {
    if (c >= '0' && c <= '9')
        return c - '0';
    c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    return c >= 'a' && c <= 'f' ? c - 'a' + 10 : -1;
}

static std::string decode(const std::string &s) {
    std::string out;
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '%' && i + 2 < s.size() && hexVal(s[i + 1]) >= 0 &&
            hexVal(s[i + 2]) >= 0) {
            out += static_cast<char>(hexVal(s[i + 1]) * 16 +
                                     hexVal(s[i + 2]));
            i += 2;
        } else {
            out += s[i];
        }
    }
    return out;
}

// name=value pairs, each side decoded then encoded once, sorted by name
// then value; a bare "uploads" becomes "uploads=".
std::string sigv4CanonicalQuery(const std::string &raw) {
    std::vector<std::pair<std::string, std::string>> kv;
    size_t pos = 0;
    while (pos <= raw.size() && !raw.empty()) {
        size_t amp = raw.find('&', pos);
        auto part = raw.substr(pos, amp == std::string::npos
                                        ? std::string::npos
                                        : amp - pos);
        auto eq = part.find('=');
        if (!part.empty())
            kv.emplace_back(
                sigv4UriEncode(decode(part.substr(0, eq)), false),
                eq == std::string::npos
                    ? ""
                    : sigv4UriEncode(decode(part.substr(eq + 1)), false));
        if (amp == std::string::npos)
            break;
        pos = amp + 1;
    }
    std::sort(kv.begin(), kv.end());
    std::string out;
    for (auto &p : kv)
        out += (out.empty() ? "" : "&") + p.first + "=" + p.second;
    return out;
}

std::string sigv4DecodePath(const std::string &s) { return decode(s); }

} // namespace pyracms
