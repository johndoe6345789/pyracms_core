#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

std::vector<std::string> SocialService::parseMentions(const std::string &text) {
    std::vector<std::string> mentions;
    std::regex mentionRegex("@(\\w+)");
    auto begin = std::sregex_iterator(text.begin(), text.end(), mentionRegex);
    auto end = std::sregex_iterator();
    for (auto it = begin; it != end; ++it) {
        mentions.push_back((*it)[1].str());
    }
    return mentions;
}

} // namespace pyracms
