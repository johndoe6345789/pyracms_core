#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::listTags(const DbClientPtr &db, int articleId, TagListCallback cb) {
    db->execSqlAsync(
        "SELECT name FROM article_tags WHERE article_id = $1 ORDER BY id",
        [cb](const drogon::orm::Result &result) {
            std::vector<std::string> tags;
            for (const auto &row : result) {
                tags.push_back(row["name"].as<std::string>());
            }
            cb(tags);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        articleId);
}

} // namespace pyracms
