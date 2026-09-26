#include "controllers/FileController.h"
#include "controllers/FileVisibility.h"
#include "filters/TenantGuard.h"
#include "filters/Viewer.h"
#include "security/FileLink.h"
#include "security/Validate.h"

#include <ctime>

namespace pyracms {

// Signed-in users only; the same rule as opening the file itself, so a
// link can never reach further than its holder could.
void FileController::link(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    if (!isValidUuid(uuid))
        return callback(filterError("File not found", drogon::k404NotFound));
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT visibility, COALESCE(tenant_id, 0) AS site FROM files "
        "WHERE uuid = $1",
        [req, callback, uuid](const drogon::orm::Result &r) {
            if (r.empty())
                return callback(
                    filterError("File not found", drogon::k404NotFound));
            auto vis = r[0]["visibility"].as<std::string>();
            if (!fileVisibleTo(vis, viewerIdFor(req, r[0]["site"].as<int>())))
                return callback(filterError("Sign in to open this file",
                                            drogon::k401Unauthorized));
            long long exp =
                static_cast<long long>(std::time(nullptr)) + kFileLinkSeconds;
            Json::Value out;
            out["exp"] = static_cast<Json::Int64>(exp);
            out["sig"] = fileLinkSig(uuid, exp);
            out["query"] = "exp=" + std::to_string(exp) +
                           "&sig=" + out["sig"].asString();
            callback(drogon::HttpResponse::newHttpJsonResponse(out));
        },
        [callback](const drogon::orm::DrogonDbException &) {
            callback(filterError("File not found", drogon::k404NotFound));
        },
        uuid);
}

} // namespace pyracms
