#include "services/ArticleAttachmentService.h"

namespace pyracms {

void ArticleAttachmentService::list(
    const DbClientPtr &db, int articleId,
    std::function<void(const std::vector<ArticleAttachmentDto> &)> cb) {
    db->execSqlAsync(
        "SELECT a.id, f.uuid, f.filename, f.mimetype, f.size "
        "FROM article_attachments a JOIN files f ON f.id = a.file_id "
        "WHERE a.article_id = $1 ORDER BY a.id",
        [cb](const drogon::orm::Result &result) {
            std::vector<ArticleAttachmentDto> out;
            for (const auto &row : result) {
                out.push_back({row["id"].as<int>(),
                               row["uuid"].as<std::string>(),
                               row["filename"].as<std::string>(),
                               row["mimetype"].as<std::string>(),
                               row["size"].as<int64_t>()});
            }
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, articleId);
}

} // namespace pyracms
