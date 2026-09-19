#include "filters/OwnerRules.h"

#include <sstream>
#include <vector>

namespace pyracms {

Target targetOf(const std::string &path) {
    std::vector<std::string> seg;
    std::stringstream ss(path);
    std::string part;
    while (std::getline(ss, part, '/')) {
        if (!part.empty())
            seg.push_back(part);
    }
    // seg = api, <area>, [<sub>,] <key>, ...
    if (seg.size() < 3 || seg[0] != "api")
        return {};
    if (seg[1] == "articles")
        return {Resource::Article, seg[2]};
    if (seg[1] == "webhooks")
        return {Resource::Webhook, seg[2]};
    if (seg[1] == "files")
        return {Resource::File, seg[2]};
    if (seg[1] == "gallery" && seg.size() >= 4) {
        if (seg[2] == "albums")
            return {Resource::Album, seg[3]};
        if (seg[2] == "pictures")
            return {Resource::Picture, seg[3]};
    }
    return {};
}

} // namespace pyracms
