#include "services/FolderRules.h"

#include <algorithm>

namespace pyracms {

static std::string trim(const std::string &s) {
    auto a = s.find_first_not_of(" \t");
    if (a == std::string::npos)
        return "";
    return s.substr(a, s.find_last_not_of(" \t") - a + 1);
}

std::optional<std::string> normalizeFolder(const std::string &raw) {
    std::string out;
    size_t depth = 0, at = 0;
    if (trim(raw).empty())
        return std::string();
    while (at <= raw.size()) {
        auto end = raw.find('/', at);
        if (end == std::string::npos)
            end = raw.size();
        auto seg = trim(raw.substr(at, end - at));
        at = end + 1;
        if (seg.empty() || seg == "." || seg == "..")
            return std::nullopt;
        if (std::any_of(seg.begin(), seg.end(), [](unsigned char c) {
                return c < 32 || c == 127 || c == '\\';
            }))
            return std::nullopt;
        out += (out.empty() ? "" : "/") + seg;
        if (++depth > kMaxFolderDepth || out.size() > kMaxFolderLength)
            return std::nullopt;
    }
    return out;
}

} // namespace pyracms
