#pragma once

#include <string>

namespace pyracms {

// ETag rules for downloads (pure, unit-tested).

// Strong validator: content hash when known, else id+size.
inline std::string fileEtag(const std::string &sha, int id, size_t size,
                            bool thumb) {
    auto tag = sha.empty() ? std::to_string(id) + "-" + std::to_string(size)
                           : sha;
    return "\"" + tag + (thumb ? "-t" : "") + "\"";
}

// If-None-Match / If-Range value list against our ETag ("*" matches).
inline bool etagMatches(const std::string &header, const std::string &etag) {
    if (header.empty())
        return false;
    if (header == "*")
        return true;
    size_t pos = 0;
    while (pos < header.size()) {
        auto end = header.find(',', pos);
        if (end == std::string::npos)
            end = header.size();
        auto tok = header.substr(pos, end - pos);
        auto s = tok.find_first_not_of(" \t");
        tok = s == std::string::npos ? "" : tok.substr(s);
        if (tok.rfind("W/", 0) == 0)
            tok = tok.substr(2);
        while (!tok.empty() && (tok.back() == ' ' || tok.back() == '\t'))
            tok.pop_back();
        if (tok == etag)
            return true;
        pos = end + 1;
    }
    return false;
}

} // namespace pyracms
