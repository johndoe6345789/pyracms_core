#include "services/SeoService.h"

namespace pyracms {

void SeoService::getArticleJsonLd(const DbClientPtr &db, int tenantId,
                                  const std::string &articleName,
                                  const std::string &baseUrl,
                                  std::function<void(const Json::Value &)> cb) {
    db->execSqlAsync(
        "SELECT a.*, u.username AS author_name, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a "
        "LEFT JOIN users u ON u.id = a.user_id "
        "WHERE a.tenant_id = $1 AND a.name = $2 AND a.is_private = false "
        "AND a.status = 'published'",
        [baseUrl, articleName, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(Json::Value::null);
                return;
            }
            const auto row = result[0];
            Json::Value ld;
            ld["@context"] = "https://schema.org";
            ld["@type"] = "Article";
            ld["headline"] = row["display_name"].as<std::string>();
            ld["url"] = baseUrl + "/articles/" + articleName;
            ld["datePublished"] = row["created_at"].as<std::string>();
            if (!row["published_at"].isNull())
                ld["dateModified"] = row["published_at"].as<std::string>();

            Json::Value author;
            author["@type"] = "Person";
            author["name"] = row["author_name"].isNull()
                                 ? "Unknown"
                                 : row["author_name"].as<std::string>();
            ld["author"] = author;

            auto content =
                row["content"].isNull() ? "" : row["content"].as<std::string>();
            if (content.size() > 200)
                content = content.substr(0, 200) + "...";
            ld["description"] = content;

            cb(ld);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(Json::Value::null); },
        tenantId, articleName);
}

} // namespace pyracms
