#include "services/CodeSnippetService.h"

namespace pyracms {

void CodeSnippetService::listSnippets(
    const DbClientPtr &db, int tenantId, const std::string &language,
    int authorId, int viewerId, int limit, int offset,
    std::function<void(const std::vector<CodeSnippetDto> &, int)> cb) {
    // Private snippets are visible to their author only.
    static const std::string where =
        "WHERE s.tenant_id = $1 "
        "AND ($2::text = '' OR s.language = $2::text) "
        "AND ($3::int = 0 OR s.author_id = $3::int) "
        "AND (s.visibility = 'public' OR s.author_id = $4::int) ";
    std::string sql =
        "SELECT s.*, u.username, COUNT(*) OVER() AS total_count "
        "FROM code_snippets s LEFT JOIN users u ON u.id = s.author_id " +
        where + "ORDER BY s.created_at DESC LIMIT " + std::to_string(limit) +
        " OFFSET " + std::to_string(offset);
    db->execSqlAsync(
        sql,
        [this, cb](const drogon::orm::Result &result) {
            std::vector<CodeSnippetDto> snippets;
            for (const auto &row : result) {
                snippets.push_back(rowToDto(row));
            }
            int total = result.empty() ? 0 : result[0]["total_count"].as<int>();
            cb(snippets, total);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}, 0); }, tenantId,
        language, authorId, viewerId);
}

} // namespace pyracms
