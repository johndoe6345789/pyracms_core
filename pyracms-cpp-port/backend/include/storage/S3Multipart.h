#pragma once

#include <cctype>
#include <string>

namespace pyracms {

// The id comes from the store and is put into a URL: only plain
// characters, or the upload is refused.
inline bool uploadIdOk(const std::string &id) {
    if (id.empty() || id.size() > 256)
        return false;
    for (unsigned char c : id) {
        if (!std::isalnum(c) && c != '-' && c != '_' && c != '.')
            return false;
    }
    return true;
}

inline std::string tagText(const std::string &xml, const std::string &tag) {
    auto open = xml.find("<" + tag + ">");
    auto close = xml.find("</" + tag + ">");
    if (open == std::string::npos || close == std::string::npos)
        return "";
    open += tag.size() + 2;
    return close > open ? xml.substr(open, close - open) : "";
}

} // namespace pyracms
