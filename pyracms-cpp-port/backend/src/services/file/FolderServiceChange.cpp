#include "services/DbError.h"
#include "services/FolderService.h"

namespace pyracms {

void FolderService::create(const DbClientPtr &db, int tenantId,
                           const std::string &path, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO file_folders (tenant_id, path) VALUES ($1, $2) "
        "ON CONFLICT DO NOTHING",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, path);
}

// LIKE needs the path's own wildcards escaped; the folder rules already
// forbid backslashes, so only % and _ can appear.
void FolderService::remove(const DbClientPtr &db, int tenantId,
                           const std::string &path, BoolCallback cb) {
    db->execSqlAsync(
        "WITH busy AS (SELECT 1 FROM files WHERE tenant_id = $1 AND "
        "(folder = $2 OR folder LIKE replace(replace($2, '%', '\\%'), '_', "
        "'\\_') || '/%') UNION ALL SELECT 1 FROM file_folders WHERE "
        "tenant_id = $1 AND path LIKE replace(replace($2, '%', '\\%'), '_', "
        "'\\_') || '/%'), gone AS (DELETE FROM file_folders WHERE "
        "tenant_id = $1 AND path = $2 AND NOT EXISTS (SELECT 1 FROM busy) "
        "RETURNING 1) SELECT (SELECT count(*) FROM busy)::int AS busy, "
        "(SELECT count(*) FROM gone)::int AS gone",
        [cb](const drogon::orm::Result &r) {
            if (r[0]["busy"].as<int>() > 0)
                cb(false, "The folder is not empty");
            else if (r[0]["gone"].as<int>() == 0)
                cb(false, "Folder not found");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, path);
}

void FolderService::move(const DbClientPtr &db, const std::string &uuid,
                         const std::string &folder, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE files SET folder = $2 WHERE uuid = $1",
        [cb](const drogon::orm::Result &r) {
            if (r.affectedRows() == 0)
                cb(false, "File not found");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        uuid, folder);
}

} // namespace pyracms
