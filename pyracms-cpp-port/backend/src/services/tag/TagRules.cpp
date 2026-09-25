#include "services/TagRules.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

static std::string clean(const std::string &raw) {
    std::string out;
    bool gap = false;
    for (unsigned char c : raw) {
        if (std::isspace(c) || c == ',' || c < 0x20) {
            gap = !out.empty();
            continue;
        }
        if (gap)
            out += '-';
        gap = false;
        out += static_cast<char>(c < 0x80 ? std::tolower(c) : c);
    }
    if (out.size() > kMaxTagLength)
        out.resize(kMaxTagLength);
    return out;
}

std::vector<std::string> normalizeTags(const std::vector<std::string> &in) {
    std::vector<std::string> out;
    for (const auto &raw : in) {
        auto tag = clean(raw);
        if (tag.empty() || std::find(out.begin(), out.end(), tag) != out.end())
            continue;
        out.push_back(tag);
        if (out.size() == kMaxTagsPerItem)
            break;
    }
    return out;
}

std::string joinTags(const std::vector<std::string> &tags) {
    std::string out;
    for (const auto &t : tags)
        out += (out.empty() ? "" : "\n") + t;
    return out;
}

std::vector<std::string> splitTagList(const std::string &list) {
    std::vector<std::string> out;
    size_t start = 0;
    while (start <= list.size()) {
        auto end = list.find(',', start);
        if (end == std::string::npos)
            end = list.size();
        if (end > start)
            out.push_back(list.substr(start, end - start));
        start = end + 1;
    }
    return out;
}

} // namespace pyracms
