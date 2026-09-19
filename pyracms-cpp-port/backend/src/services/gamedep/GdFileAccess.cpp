#include "services/gamedep/GdFileAccess.h"

#include "services/gamedep/GdVisibility.h"

namespace pyracms {

// Every page that refers to the file: through a revision's source
// archive, a binary, or a screenshot. `pub` = that reference is public.
static const char *kRefs =
    "WITH refs AS ("
    "SELECT p.owner_id, p.tenant_id, p.id AS pid, "
    "(NOT p.is_private AND r.published) AS pub "
    "FROM files f JOIN gamedep_revisions r ON r.file_id = f.id "
    "JOIN gamedep_pages p ON p.id = r.page_id WHERE f.uuid = $1 "
    "UNION ALL SELECT p.owner_id, p.tenant_id, p.id, "
    "(NOT p.is_private AND r.published) "
    "FROM files f JOIN gamedep_binaries b ON b.file_id = f.id "
    "JOIN gamedep_revisions r ON r.id = b.revision_id "
    "JOIN gamedep_pages p ON p.id = r.page_id WHERE f.uuid = $1 "
    "UNION ALL SELECT p.owner_id, p.tenant_id, p.id, "
    "(NOT p.is_private AND EXISTS (SELECT 1 FROM gamedep_revisions x "
    "WHERE x.page_id = p.id AND x.published)) "
    "FROM files f JOIN gamedep_screenshots s ON s.file_id = f.id "
    "JOIN gamedep_pages p ON p.id = s.page_id WHERE f.uuid = $1) ";

void gdFileAccess(const drogon::orm::DbClientPtr &db,
                  const std::string &uuid, int viewerId, int viewerTenant,
                  std::function<void(GdFileAccess)> cb) {
    // $1 uuid, $2 viewer tenant, $3 viewer (as gdManagerSql expects).
    std::string sql =
        std::string(kRefs) +
        "SELECT COUNT(*) AS n, COALESCE(bool_or(pub), FALSE) AS pub, "
        "COALESCE(bool_or(($2 = 0 OR $2 = COALESCE(p.tenant_id, 0)) AND " +
        gdManagerSql() + "), FALSE) AS mine FROM refs p";
    db->execSqlAsync(
        sql,
        [cb](const drogon::orm::Result &r) {
            bool open = r[0]["n"].as<int64_t>() == 0;
            bool ok = r[0]["pub"].as<bool>() || r[0]["mine"].as<bool>();
            cb(open ? GdFileAccess::Open
                    : ok ? GdFileAccess::Public : GdFileAccess::Denied);
        },
        // Fail closed: an unanswerable query never opens a file.
        [cb](const drogon::orm::DrogonDbException &) {
            cb(GdFileAccess::Denied);
        },
        uuid, viewerTenant, viewerId);
}

} // namespace pyracms
