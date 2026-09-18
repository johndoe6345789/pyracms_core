#include "services/CodeSnippetService.h"

namespace pyracms {

void CodeSnippetService::getSnippet(
    const DbClientPtr &db, int snippetId, int scopeTenant, int viewerId,
    std::function<void(const std::optional<CodeSnippetDto> &)> cb) {
    // scopeTenant 0 = any site. Private snippets: author only.
    db->execSqlAsync(
        "SELECT s.*, u.username FROM code_snippets s "
        "LEFT JOIN users u ON u.id = s.author_id "
        "WHERE s.id = $1 AND ($2::int = 0 OR s.tenant_id = $2::int) "
        "AND (s.visibility = 'public' OR s.author_id = $3::int)",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        snippetId, scopeTenant, viewerId);
}

} // namespace pyracms
