#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::setTags(const DbClientPtr &db, int articleId,
                              const std::vector<std::string> &tags,
                              BoolCallback cb) {
    // Delete existing tags, then insert new ones
    db->execSqlAsync(
        "DELETE FROM article_tags WHERE article_id = $1",
        [this, db, articleId, tags, cb](const drogon::orm::Result &) {
            if (tags.empty()) {
                cb(true, "");
                return;
            }

            // Build bulk insert
            std::string sql = "INSERT INTO article_tags (article_id, tag) VALUES ";
            std::vector<std::string> placeholders;
            int paramIdx = 1;
            for (size_t i = 0; i < tags.size(); ++i) {
                placeholders.push_back(
                    "($" + std::to_string(paramIdx++) + ", $" +
                    std::to_string(paramIdx++) + ")");
            }
            for (size_t i = 0; i < placeholders.size(); ++i) {
                if (i > 0) sql += ", ";
                sql += placeholders[i];
            }

            // Build params: alternating articleId and tag
            // Use a simpler approach with individual inserts for reliability
            // Re-do with a single batch approach using string params
            auto remaining = std::make_shared<int>(static_cast<int>(tags.size()));
            auto failed = std::make_shared<bool>(false);
            auto errorMsg = std::make_shared<std::string>();

            for (const auto &tag : tags) {
                db->execSqlAsync(
                    "INSERT INTO article_tags (article_id, name) VALUES ($1, $2)",
                    [remaining, failed, cb](const drogon::orm::Result &) {
                        (*remaining)--;
                        if (*remaining == 0 && !*failed) {
                            cb(true, "");
                        }
                    },
                    [remaining, failed, errorMsg, cb](const drogon::orm::DrogonDbException &e) {
                        (*remaining)--;
                        if (!*failed) {
                            *failed = true;
                            *errorMsg = e.base().what();
                        }
                        if (*remaining == 0) {
                            cb(false, *errorMsg);
                        }
                    },
                    articleId, tag);
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId);
}

} // namespace pyracms
