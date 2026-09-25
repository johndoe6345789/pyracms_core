#include "services/TagService.h"

namespace pyracms {

void TagService::cloud(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<TagCount> &)> cb) {
    db->execSqlAsync(
        "SELECT name, sum(articles)::int AS articles, "
        "sum(snippets)::int AS snippets FROM ("
        "SELECT lower(t.name) AS name, count(*) AS articles, 0 AS snippets "
        "FROM article_tags t JOIN articles a ON a.id = t.article_id "
        "WHERE a.tenant_id = $1 AND NOT a.is_private "
        "AND a.status = 'published' AND btrim(t.name) <> '' GROUP BY 1 "
        "UNION ALL "
        "SELECT lower(t.name), 0, count(*) FROM snippet_tags t "
        "JOIN code_snippets s ON s.id = t.snippet_id "
        "WHERE s.tenant_id = $1 AND s.visibility = 'public' GROUP BY 1) x "
        "GROUP BY name ORDER BY sum(articles + snippets) DESC, name "
        "LIMIT $2::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<TagCount> out;
            for (const auto &row : result)
                out.push_back({row["name"].as<std::string>(),
                               row["articles"].as<int>(),
                               row["snippets"].as<int>()});
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId,
        limit);
}

} // namespace pyracms
