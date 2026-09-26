#include "controllers/FileBlob.h"
#include "controllers/FileVisibility.h"
#include "filters/TenantGuard.h"
#include "filters/Viewer.h"
#include "security/FileLink.h"
#include "services/gamedep/GdFileAccess.h"

#include <ctime>

namespace pyracms {

// Game/dep content follows the page's visibility (public: anyone,
// private/draft: managers only, else 404 - never a hint it exists);
// every other file keeps the uuid-capability rules, except that a file
// marked "authenticated" also needs a signed-in viewer of its site or a
// signed link from one (401).
void withFileAccess(const drogon::HttpRequestPtr &req,
                    const drogon::orm::DbClientPtr &db,
                    const std::string &uuid,
                    const std::function<void(const drogon::HttpResponsePtr &)>
                        &callback,
                    std::function<void()> allowed) {
    auto v = viewerOf(req);
    gdFileAccess(db, uuid, v.userId, v.tenantId, [=](GdFileAccess a) {
        if (a == GdFileAccess::Denied)
            return callback(
                filterError("File not found", drogon::k404NotFound));
        db->execSqlAsync(
            "SELECT visibility, COALESCE(tenant_id, 0) AS site FROM files "
            "WHERE uuid = $1",
            [=](const drogon::orm::Result &r) {
                if (r.empty())
                    return allowed(); // the handler answers 404
                auto site = r[0]["site"].as<int>();
                auto vis = r[0]["visibility"].as<std::string>();
                if (fileVisibleTo(vis, viewerIdFor(req, site)) ||
                    fileLinkValid(uuid, req->getParameter("exp"),
                                  req->getParameter("sig"),
                                  static_cast<long long>(std::time(nullptr))))
                    return allowed();
                callback(filterError("Sign in to open this file",
                                     drogon::k401Unauthorized));
            },
            // Fail closed, like the game/dep check above.
            [callback](const drogon::orm::DrogonDbException &) {
                callback(filterError("File not found",
                                     drogon::k404NotFound));
            },
            uuid);
    });
}

} // namespace pyracms
