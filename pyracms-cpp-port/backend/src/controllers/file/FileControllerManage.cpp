#include "controllers/FileController.h"
#include "filters/AdminFilter.h"
#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"
#include "filters/UserVisibility.h"

#include <filesystem>

namespace pyracms {

// Authorisation (uploader or site admin) was decided by OwnerFilter, and it
// also proved `uuid` is a well-formed uuid, so the paths below are safe.
void FileController::remove(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    fileService_.deleteFile(
        drogon::app().getDbClient(), uuid,
        [callback, uuid](bool success, const std::string &) {
            if (!success) {
                callback(filterError("Could not delete the file",
                                     drogon::k500InternalServerError));
                return;
            }
            auto dir = getUploadDir();
            std::error_code ec;
            std::filesystem::remove(dir + "/" + uuid, ec);
            std::filesystem::remove(dir + "/thumbnails/" + uuid, ec);
            Json::Value r;
            r["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        });
}

// Members see their own uploads; a site admin sees the site's; the
// platform admin sees everything. A site owner (platform token) names the
// site with ?tenant_id= to see all of its files.
void FileController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    int limit = clampLimit(req->getParameter("limit"), 50, 200);
    int offset = clampOffset(req->getParameter("offset"));
    int actor = req->attributes()->get<int>("userId");
    int role = req->attributes()->get<int>("role");
    int tenant = tokenTenantOf(req);
    bool admin = roleAllows(role, UserRole::SiteAdmin);
    int named = firstNamedTenant(namedTenants(req));
    auto run = [=, this](bool owns) {
        int scopeUser = (admin || owns) ? 0 : actor;
        int scopeTenant = owns ? named : (admin && tenant != 0) ? tenant : -1;
        fileService_.listFiles(
            drogon::app().getDbClient(), limit, offset, scopeUser,
            scopeTenant, [callback](const std::vector<FileDto> &files) {
                callback(filesJson(files));
            });
    };
    if (admin || named == 0 || (tenant != 0 && tenant != named))
        return run(false);
    AdminFilter::ownerLookup()(actor, named, run);
}

} // namespace pyracms
