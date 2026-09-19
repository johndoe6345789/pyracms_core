#include "controllers/article/ArticleControllerJson.h"

namespace pyracms {

Json::Value articleJson(const ArticleDto &article, const std::string &username,
                        const std::vector<ArticleRevisionDto> &revisions,
                        const std::vector<std::string> &tags, bool full) {
    Json::Value result;
    result["id"] = article.id;
    result["name"] = article.name;
    result["displayName"] = article.displayName;
    result["isPrivate"] = article.isPrivate;
    result["hideDisplayName"] = article.hideDisplayName;
    result["userId"] = article.userId;
    result["authorUsername"] = username;
    result["rendererName"] = article.rendererName;
    result["viewCount"] = article.viewCount;
    result["createdAt"] = article.createdAt;
    result["status"] = article.status;
    if (full) {
        result["publishedAt"] = article.publishedAt;
        result["scheduledAt"] = article.scheduledAt;
    }
    result["revisionCount"] = static_cast<int>(revisions.size());
    result["content"] = revisions.empty() ? "" : revisions[0].content;
    Json::Value tagsArray(Json::arrayValue);
    for (const auto &tag : tags) {
        tagsArray.append(tag);
    }
    result["tags"] = tagsArray;
    return result;
}

} // namespace pyracms
