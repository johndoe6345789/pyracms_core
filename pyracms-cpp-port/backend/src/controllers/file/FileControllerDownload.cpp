#include "controllers/FileBlob.h"
#include "controllers/FileController.h"
#include "controllers/FileRange.h"
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
void FileController::download(const drogon::HttpRequestPtr &req,
                              Reply &&callback, const std::string &uuid) {
    if (!isValidUuid(uuid))
        return notFound(callback);
    auto db = drogon::app().getDbClient();
    withFileAccess(req, db, uuid, callback, [=]() {
        fileService_.getFile(
            db, uuid, [=](const std::optional<FileDto> &file) {
                if (!file)
                    return notFound(callback);
                auto store = BlobRegistry::named(file->storage);
                if (!store)
                    return callback(blobFailure(BlobStatus::Unavailable));
                loadBlob(store, {file->tenantId, uuid, false},
                         [=](BlobStatus s, BlobPayload p) {
                             if (s != BlobStatus::Ok)
                                 return callback(blobFailure(s));
                             // Always a download, never rendered in place
                             auto resp = serveBlob(req, p, *file, true,
                                                   false);
                             callback(resp);
                             if (resp->statusCode() != drogon::k200OK &&
                                 resp->statusCode() !=
                                     drogon::k206PartialContent)
                                 return;
                             if (countsAsDownload(req->getHeader("range")))
                                 fileService_.incrementDownloadCount(
                                     db, uuid,
                                     [](bool, const std::string &) {});
                         });
            });
    });
}

} // namespace pyracms
