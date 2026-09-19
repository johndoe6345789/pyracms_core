#include "controllers/FileBlob.h"
#include "controllers/FileController.h"
#include "filters/AdminFilter.h"
#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"
#include "filters/UserVisibility.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

// Authorisation (uploader or site admin) was decided by OwnerFilter, and it
// also proved `uuid` is a well-formed uuid. The bytes go first: when the
// store cannot be reached the row stays, so the delete can be retried.
void FileController::remove(
    const drogon::HttpRequestPtr &,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &uuid) {
    auto db = drogon::app().getDbClient();
    fileService_.getFile(
        db, uuid,
        [this, callback, uuid, db](const std::optional<FileDto> &file) {
            auto store = file ? BlobRegistry::named(file->storage) : nullptr;
            if (file && !store)
                return callback(blobFailure(BlobStatus::Unavailable));
            auto dropRow = [=, this](BlobStatus s) {
                if (s != BlobStatus::Ok && s != BlobStatus::NotFound)
                    return callback(blobFailure(s));
                fileService_.deleteFile(
                    db, uuid, [callback](bool ok, const std::string &) {
                        if (!ok)
                            return callback(filterError(
                                "Could not delete the file",
                                drogon::k500InternalServerError));
                        Json::Value r;
                        r["success"] = true;
                        callback(drogon::HttpResponse::newHttpJsonResponse(r));
                    });
            };
            if (!store)
                return dropRow(BlobStatus::Ok);
            BlobKey key{file->tenantId, uuid, false};
            key.thumb = true;
            store->remove(key, [](BlobStatus) {});
            key.thumb = false;
            store->remove(key, dropRow);
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
