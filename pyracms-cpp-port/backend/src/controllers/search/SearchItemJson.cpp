#include "controllers/SearchItemJson.h"

namespace pyracms {

// "/forum/thread/<id>" -> id (0 when the url is anything else).
static int threadIdOf(const std::string &url) {
    static const std::string prefix = "/forum/thread/";
    if (url.rfind(prefix, 0) != 0)
        return 0;
    auto digits = url.substr(prefix.size());
    if (digits.empty() || digits.size() > 9 ||
        digits.find_first_not_of("0123456789") != std::string::npos)
        return 0;
    return std::stoi(digits);
}

Json::Value searchItemJson(const SearchResultItem &item) {
    Json::Value j;
    j["type"] = item.type;
    j["id"] = item.id;
    j["title"] = item.title;
    j["snippet"] = item.snippet;
    j["url"] = item.url;
    j["rank"] = item.rank;
    j["createdAt"] = item.createdAt;
    if (item.type == "forum_post") {
        j["postId"] = item.id;
        j["threadId"] = threadIdOf(item.url);
    }
    return j;
}

} // namespace pyracms
