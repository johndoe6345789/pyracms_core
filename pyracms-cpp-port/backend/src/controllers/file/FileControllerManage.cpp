#include "controllers/FileBlob.h"
#include "controllers/FileController.h"
#include "filters/AdminFilter.h"
#include "filters/RoleRules.h"
#include "filters/TenantGuard.h"
#include "filters/UserVisibility.h"
#include "services/FolderRules.h"
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
            auto dropRow = [=](BlobStatus s) {
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

} // namespace pyracms
