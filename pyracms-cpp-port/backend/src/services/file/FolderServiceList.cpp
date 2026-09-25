#include "services/FolderService.h"

namespace pyracms {

void FolderService::list(
    const DbClientPtr &db, int tenantId,
    std::function<void(const std::vector<std::string> &)> cb) {
    db->execSqlAsync(
        "SELECT path FROM (SELECT path FROM file_folders WHERE tenant_id = $1 "
        "UNION SELECT folder FROM files WHERE tenant_id = $1 AND folder <> ''"
        ") x ORDER BY path",
        [cb](const drogon::orm::Result &rows) {
            std::vector<std::string> out;
            for (const auto &r : rows)
                out.push_back(r["path"].as<std::string>());
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId);
}

} // namespace pyracms
