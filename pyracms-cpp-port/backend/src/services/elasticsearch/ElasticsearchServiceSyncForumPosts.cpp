#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void esSyncForumPosts(ElasticsearchService &es,
                      const drogon::orm::DbClientPtr &db, int tenantId) {
    db->execSqlAsync(
        "SELECT p.id, p.title, p.content, p.thread_id, p.created_at "
        "FROM forum_posts p "
        "JOIN forum_threads t ON t.id = p.thread_id "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id "
        "WHERE c.tenant_id = $1",
        [&es, tenantId](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                es.indexForumPost(
                    tenantId, row["id"].as<int>(),
                    row["title"].isNull() ? "" : row["title"].as<std::string>(),
                    row["content"].as<std::string>(),
                    row["thread_id"].as<int>(),
                    row["created_at"].as<std::string>());
            }
            LOG_INFO << "Synced " << result.size()
                     << " forum posts to Elasticsearch";
        },
        [](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "ES sync forum posts failed: " << dbError(e);
        },
        tenantId);
}

} // namespace pyracms
