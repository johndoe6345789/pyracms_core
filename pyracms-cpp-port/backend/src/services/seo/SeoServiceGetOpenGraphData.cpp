#include "services/SeoService.h"

namespace pyracms {

void SeoService::getOpenGraphData(const DbClientPtr &db, int tenantId,
                                  const std::string &articleName,
                                  const std::string &baseUrl,
                                  std::function<void(const Json::Value &)> cb) {
    db->execSqlAsync(
        "SELECT a.display_name, a.created_at, u.username AS author_name, "
        "  (SELECT LEFT(content, 200) FROM article_revisions WHERE article_id "
        "= a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS description "
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
            Json::Value og;
            og["og:type"] = "article";
            og["og:title"] = row["display_name"].as<std::string>();
            og["og:url"] = baseUrl + "/articles/" + articleName;
            og["og:description"] = row["description"].isNull()
                                       ? ""
                                       : row["description"].as<std::string>();
            og["article:published_time"] = row["created_at"].as<std::string>();
            og["article:author"] = row["author_name"].isNull()
                                       ? ""
                                       : row["author_name"].as<std::string>();
            cb(og);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(Json::Value::null); },
        tenantId, articleName);
}

} // namespace pyracms
