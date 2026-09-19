#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void esSyncArticles(ElasticsearchService &es,
                    const drogon::orm::DbClientPtr &db, int tenantId) {
    db->execSqlAsync(
        "SELECT a.id, a.name, a.display_name, a.created_at, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a WHERE a.tenant_id = $1 AND a.status = 'published' "
        "AND a.is_private = false",
        [&es, tenantId](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                es.indexArticle(tenantId, row["id"].as<int>(),
                                row["name"].as<std::string>(),
                                row["display_name"].as<std::string>(),
                                row["content"].isNull()
                                    ? ""
                                    : row["content"].as<std::string>(),
                                row["created_at"].as<std::string>());
            }
            LOG_INFO << "Synced " << result.size()
                     << " articles to Elasticsearch";
        },
        [](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "ES sync articles failed: " << dbError(e);
        },
        tenantId);
}

} // namespace pyracms
