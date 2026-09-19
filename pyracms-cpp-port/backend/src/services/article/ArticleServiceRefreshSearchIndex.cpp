#include "services/ArticleService.h"
#include "services/ElasticsearchService.h"

namespace pyracms {

// Keeps the Elasticsearch copy in step with the article: only published,
// public articles may be searchable, so making one private, unpublishing,
// scheduling or editing it re-indexes it (or drops it) at once.
// GCOVR_EXCL_START (needs a live Elasticsearch cluster)
void ArticleService::refreshSearchIndex(const DbClientPtr &db,
                                        int articleId) {
    if (!ElasticsearchService::instance().isConfigured())
        return;
    db->execSqlAsync(
        "SELECT a.id, a.tenant_id, a.name, a.display_name, a.created_at, "
        "a.is_private, a.status, (SELECT content FROM article_revisions "
        "WHERE article_id = a.id ORDER BY created_at DESC LIMIT 1) "
        "AS content FROM articles a WHERE a.id = $1",
        [articleId](const drogon::orm::Result &r) {
            auto &es = ElasticsearchService::instance();
            if (r.empty() || r[0]["is_private"].as<bool>() ||
                r[0]["status"].as<std::string>() != "published") {
                es.deleteDocument("pyracms_articles", articleId);
                return;
            }
            const auto &row = r[0];
            es.indexArticle(
                row["tenant_id"].as<int>(), articleId,
                row["name"].as<std::string>(),
                row["display_name"].as<std::string>(),
                row["content"].isNull() ? "" : row["content"].as<std::string>(),
                row["created_at"].as<std::string>());
        },
        [](const drogon::orm::DrogonDbException &) {}, articleId);
}
// GCOVR_EXCL_STOP

} // namespace pyracms
