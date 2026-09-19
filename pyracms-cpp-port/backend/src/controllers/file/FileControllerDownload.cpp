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

// The uuid is checked for shape before it is ever turned into a key; the
// file row says which store holds the bytes.
void FileController::download(
    const drogon::HttpRequestPtr &, Reply &&callback,
    const std::string &uuid) {
    if (!isValidUuid(uuid))
        return notFound(callback);
    auto db = drogon::app().getDbClient();
    fileService_.getFile(
        db, uuid,
        [this, callback, uuid, db](const std::optional<FileDto> &file) {
            if (!file)
                return notFound(callback);
            auto store = BlobRegistry::named(file->storage);
            if (!store)
                return callback(blobFailure(BlobStatus::Unavailable));
            loadBlob(store, {file->tenantId, uuid, false},
                     [=, this](BlobStatus s, BlobPayload p) {
                         if (s != BlobStatus::Ok)
                             return callback(blobFailure(s));
                         // Always a download, never rendered in our origin
                         callback(blobResponse(p, *file, true));
                         fileService_.incrementDownloadCount(
                             db, uuid, [](bool, const std::string &) {});
                     });
        });
}

// The thumbnail when one was stored, else the original.
void FileController::thumbnail(
    const drogon::HttpRequestPtr &, Reply &&callback,
    const std::string &uuid) {
    if (!isValidUuid(uuid))
        return notFound(callback);
    fileService_.getFile(
        drogon::app().getDbClient(), uuid,
        [callback, uuid](const std::optional<FileDto> &file) {
            if (!file)
                return notFound(callback);
            auto store = BlobRegistry::named(file->storage);
            if (!store)
                return callback(blobFailure(BlobStatus::Unavailable));
            auto done = [=](BlobStatus s, BlobPayload p) {
                callback(s == BlobStatus::Ok ? blobResponse(p, *file, false)
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
}

} // namespace pyracms
