#include "controllers/FileController.h"
#include "filters/AdminFilter.h"
#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"
#include "filters/UserVisibility.h"
#include "services/FolderRules.h"

namespace pyracms {

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
    // ?folder= narrows to one folder ("" = the top); absent = every file.
    std::string folder = "*";
    if (req->getParameters().count("folder")) {
        auto f = normalizeFolder(req->getParameter("folder"));
        if (!f)
            return callback(
                filterError("Invalid folder", drogon::k400BadRequest));
        folder = *f;
    }
    auto run = [=](bool owns) {
        int scopeUser = (admin || owns) ? 0 : actor;
        int scopeTenant = owns ? named : (admin && tenant != 0) ? tenant : -1;
        fileService_.listFiles(
            drogon::app().getDbClient(), limit, offset, scopeUser,
            scopeTenant, folder, [callback](const std::vector<FileDto> &files) {
                callback(filesJson(files));
            });
    };
    if (admin || named == 0 || (tenant != 0 && tenant != named))
        return run(false);
    AdminFilter::ownerLookup()(actor, named, run);
}

} // namespace pyracms
