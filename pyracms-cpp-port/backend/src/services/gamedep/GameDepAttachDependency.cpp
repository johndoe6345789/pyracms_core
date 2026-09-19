#include "services/GameDepService.h"
#include "services/DbError.h"

namespace pyracms {

static void addPip(const GdCtx &c, int pageId, const std::string &n,
                   const std::string &v, GdCb cb) {
    c.db->execSqlAsync(
        "INSERT INTO gamedep_dependencies (game_id, kind, name, version) "
        "VALUES ($1, 'pip', $2, $3)",
        [cb](const drogon::orm::Result &) { cb(gdOk(201)); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(gdDbError(dbError(e)));
        },
        pageId, n, v);
}

void GameDepAttachService::addDependency(
    const GdCtx &c, const std::string &type, const std::string &name,
    const Json::Value &body, GdCb cb) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            std::string dn = body.get("name", "").asString();
            std::string dv = body.get("version", "").asString();
            if (body.get("kind", "pyracms").asString() == "pip" &&
                !dn.empty()) {
                addPip(c, pageId, dn, dv, cb);
                return;
            }
            // Same-site dep revision, by id or by name + version.
            c.db->execSqlAsync(
                "INSERT INTO gamedep_dependencies (game_id, kind, name, "
                "version, dep_revision_id) SELECT $1, 'pyracms', p.name, "
                "r.version, r.id FROM gamedep_revisions r "
                "JOIN gamedep_pages p ON p.id = r.page_id "
                "WHERE COALESCE(p.tenant_id, 0) = $2 AND p.type = 'dep' "
                "AND (r.id = $3 OR (p.name = $4 AND r.version = $5))",
                [cb](const drogon::orm::Result &r) {
                    cb(r.affectedRows()
                           ? gdOk(201)
                           : gdError(404, "Dependency not found"));
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                pageId, c.scope, body.get("depRevisionId", 0).asInt(), dn,
                dv);
        },
        cb);
}

void GameDepAttachService::removeDependency(
    const GdCtx &c, const std::string &type, const std::string &name,
    int id, GdCb cb) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_dependencies "
                "WHERE id = $1 AND game_id = $2",
                [cb](const drogon::orm::Result &r) {
                    cb(r.affectedRows()
                           ? gdOk()
                           : gdError(404, "Dependency not found"));
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                id, pageId);
        },
        cb);
}

} // namespace pyracms
