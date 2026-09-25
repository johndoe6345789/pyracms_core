#include "services/ArticleAttachmentService.h"
#include "services/DbError.h"

namespace pyracms {

void ArticleAttachmentService::add(const DbClientPtr &db, int tenantId,
                                   const std::string &name,
                                   const std::string &fileUuid,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO article_attachments (article_id, file_id) "
        "SELECT a.id, f.id FROM articles a, files f "
        "WHERE a.tenant_id = $1 AND a.name = $2 AND f.uuid = $3 "
        "ON CONFLICT (article_id, file_id) DO NOTHING RETURNING id",
        [cb](const drogon::orm::Result &result) {
            if (result.empty())
                cb(false, "Article not found, already attached, or the "
                          "file does not exist");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, name, fileUuid);
}

void ArticleAttachmentService::remove(const DbClientPtr &db, int tenantId,
                                      const std::string &name,
                                      int attachmentId, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM article_attachments x USING articles a "
        "WHERE x.id = $1 AND a.id = x.article_id "
        "AND a.tenant_id = $2 AND a.name = $3",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0)
                cb(false, "Attachment not found");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        attachmentId, tenantId, name);
}

} // namespace pyracms
