#include "services/CodeSnippetService.h"

namespace pyracms {

void CodeSnippetService::listAttachments(
    const DbClientPtr &db, int snippetId,
    std::function<void(const std::vector<SnippetAttachmentDto> &)> cb) {
    db->execSqlAsync(
        "SELECT a.id, f.uuid, f.filename, f.mimetype, f.size "
        "FROM snippet_attachments a JOIN files f ON f.id = a.file_id "
        "WHERE a.snippet_id = $1 ORDER BY a.id",
        [cb](const drogon::orm::Result &result) {
            std::vector<SnippetAttachmentDto> out;
            out.reserve(result.size());
            for (const auto &row : result) {
                out.push_back({row["id"].as<int>(), row["uuid"].as<std::string>(),
                               row["filename"].as<std::string>(),
                               row["mimetype"].as<std::string>(),
                               row["size"].as<int64_t>()});
            }
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, snippetId);
}

} // namespace pyracms
