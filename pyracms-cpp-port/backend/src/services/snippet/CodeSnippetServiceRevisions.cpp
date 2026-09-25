#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

namespace {

// Numbered per snippet, oldest = 1, by position in the snippet's history.
const char *kNumbered =
    "SELECT r.id, r.rn AS number, r.snippet_id, r.title, r.code, "
    "r.language, r.summary, COALESCE(r.user_id, 0) AS user_id, "
    "COALESCE(u.username, '') AS author, r.created_at "
    "FROM (SELECT *, row_number() OVER (ORDER BY id) AS rn "
    "FROM snippet_revisions WHERE snippet_id = $1) r "
    "LEFT JOIN users u ON u.id = r.user_id ";

SnippetRevisionDto toDto(const drogon::orm::Row &row) {
    return {row["id"].as<int>(),
            row["number"].as<int>(),
            row["snippet_id"].as<int>(),
            row["title"].as<std::string>(),
            row["code"].as<std::string>(),
            row["language"].as<std::string>(),
            row["summary"].as<std::string>(),
            row["user_id"].as<int>(),
            row["author"].as<std::string>(),
            row["created_at"].as<std::string>()};
}

} // namespace

void CodeSnippetService::listRevisions(
    const DbClientPtr &db, int snippetId, int limit,
    std::function<void(const std::vector<SnippetRevisionDto> &)> cb) {
    db->execSqlAsync(
        std::string(kNumbered) + "ORDER BY r.id DESC LIMIT $2::int",
        [cb](const drogon::orm::Result &result) {
            std::vector<SnippetRevisionDto> out;
            for (const auto &row : result)
                out.push_back(toDto(row));
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, snippetId,
        limit);
}

void CodeSnippetService::getRevision(
    const DbClientPtr &db, int snippetId, int number,
    std::function<void(const std::optional<SnippetRevisionDto> &)> cb) {
    db->execSqlAsync(
        std::string(kNumbered) + "WHERE r.rn = $2::int",
        [cb](const drogon::orm::Result &result) {
            if (result.empty())
                return cb(std::nullopt);
            cb(toDto(result[0]));
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        snippetId, number);
}

} // namespace pyracms
