#include "controllers/FileBlob.h"
#include "controllers/FileController.h"
#include "controllers/FileView.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

using Reply = std::function<void(const drogon::HttpResponsePtr &)>;

// Opens a file in the browser instead of downloading it, for the kinds that
// are safe to show (see viewMime). Same access rules as a download; not
// counted as a download; big files are download-only.
void FileController::view(const drogon::HttpRequestPtr &req, Reply &&callback,
                          const std::string &uuid) {
    auto notFound = [callback] {
        callback(filterError("File not found", drogon::k404NotFound));
    };
    if (!isValidUuid(uuid))
        return notFound();
    auto db = drogon::app().getDbClient();
    withFileAccess(req, db, uuid, callback, [=]() {
        fileService_.getFile(
            db, uuid, [=](const std::optional<FileDto> &file) {
                if (!file)
                    return notFound();
                auto mime = viewMime(file->filename);
                if (mime.empty() || file->size > 50 * 1024 * 1024)
                    return callback(filterError(
                        "This file can only be downloaded",
                        drogon::k415UnsupportedMediaType));
                auto store = BlobRegistry::named(file->storage);
                if (!store)
                    return callback(blobFailure(BlobStatus::Unavailable));
                loadBlob(store, {file->tenantId, uuid, false},
                         [=](BlobStatus s, BlobPayload p) {
                             if (s != BlobStatus::Ok)
                                 return callback(blobFailure(s));
                             auto resp = serveBlob(req, p, *file, false, false);
                             resp->setContentTypeString(mime);
                             resp->addHeader("X-Content-Type-Options",
                                             "nosniff");
                             resp->addHeader(
                                 "Content-Security-Policy",
                                 "default-src 'none'; style-src "
                                 "'unsafe-inline'; img-src data:; media-src "
                                 "'self'");
                             callback(resp);
                         });
            });
    });
}

} // namespace pyracms
