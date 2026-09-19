#include "controllers/FileBlob.h"
#include "controllers/FileController.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

using Reply = std::function<void(const drogon::HttpResponsePtr &)>;

static void notFound(const Reply &callback) {
    callback(filterError("File not found", drogon::k404NotFound));
}

// The thumbnail when one was stored, else the original.
void FileController::thumbnail(const drogon::HttpRequestPtr &req,
                               Reply &&callback, const std::string &uuid) {
    if (!isValidUuid(uuid))
        return notFound(callback);
    auto db = drogon::app().getDbClient();
    withFileAccess(req, db, uuid, callback, [=, this]() {
        fileService_.getFile(
            db, uuid, [=](const std::optional<FileDto> &file) {
                if (!file)
                    return notFound(callback);
                auto store = BlobRegistry::named(file->storage);
                if (!store)
                    return callback(blobFailure(BlobStatus::Unavailable));
                auto done = [=](BlobStatus s, BlobPayload p) {
                    callback(s == BlobStatus::Ok
                                 ? serveBlob(req, p, *file, false, true)
                                 : blobFailure(s));
                };
                loadBlob(store, {file->tenantId, uuid, true},
                         [=](BlobStatus s, BlobPayload p) {
                             if (s != BlobStatus::NotFound)
                                 return done(s, std::move(p));
                             loadBlob(store, {file->tenantId, uuid, false},
                                      done);
                         });
            });
    });
}

} // namespace pyracms
