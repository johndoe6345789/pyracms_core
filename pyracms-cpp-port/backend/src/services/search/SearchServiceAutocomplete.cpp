#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/search/SearchServiceInternal.h"

#include <cctype>
#include <memory>
#include <mutex>

namespace pyracms {

void SearchService::autocomplete(
    const DbClientPtr &db, int tenantId, const std::string &prefix, int limit,
    std::function<void(const std::vector<AutocompleteItem> &)> cb) {
    // GCOVR_EXCL_START (Elasticsearch/Redis glue: needs a live cluster)
    if (useElasticsearch()) {
        esAutocomplete(tenantId, prefix, limit, cb, [=]() {
            autocompletePostgres(db, tenantId, prefix, limit, cb);
        });
        return;
    }
    // GCOVR_EXCL_STOP
    autocompletePostgres(db, tenantId, prefix, limit, cb);
}

void SearchService::autocompletePostgres(
    const DbClientPtr &db, int tenantId, const std::string &prefix, int limit,
    std::function<void(const std::vector<AutocompleteItem> &)> cb) {
    // Fallback: PostgreSQL prefix search
    // Escape LIKE wildcards so the caller's text is matched literally
    std::string likePattern;
    for (char c : prefix) {
        if (c == '%' || c == '_' || c == '\\')
            likePattern += '\\';
        likePattern += c;
    }
    likePattern += "%";

    db->execSqlAsync(
        "("
        "  SELECT display_name AS text, 'article' AS type, "
        "  '/articles/' || name AS url "
        "  FROM articles WHERE tenant_id = $1 AND status = 'published' "
        "  AND is_private = false "
        "  AND LOWER(display_name) LIKE LOWER($2) LIMIT $3::int"
        ") UNION ALL ("
        "  SELECT title AS text, 'forum_post' AS type, "
        "  '/forum/thread/' || thread_id::text AS url "
        "  FROM forum_posts p "
        "  JOIN forum_threads t ON t.id = p.thread_id "
        "  JOIN forums f ON f.id = t.forum_id "
        "  JOIN forum_categories c ON c.id = f.category_id "
        "  WHERE c.tenant_id = $1 AND p.title IS NOT NULL "
        "  AND LOWER(p.title) LIKE LOWER($2) LIMIT $3::int"
        ") UNION ALL ("
        "  SELECT display_name AS text, 'gamedep' AS type, "
        "  '/gamedep/' || name AS url "
        "  FROM gamedep_pages WHERE tenant_id = $1 "
        "  AND NOT is_private AND EXISTS (SELECT 1 FROM "
        "gamedep_revisions gr WHERE gr.page_id = gamedep_pages.id AND "
        "gr.published) AND LOWER(display_name) LIKE LOWER($2) LIMIT $3::int"
        ") LIMIT $3::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<AutocompleteItem> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                AutocompleteItem item;
                item.text = row["text"].as<std::string>();
                item.type = row["type"].as<std::string>();
                item.url = row["url"].as<std::string>();
                items.push_back(item);
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId,
        likePattern, limit);
}

} // namespace pyracms
