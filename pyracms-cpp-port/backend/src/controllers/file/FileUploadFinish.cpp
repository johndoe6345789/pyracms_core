#include "controllers/FileController.h"
#include "controllers/FileUploadCommon.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

void finishUpload(FileService &files, FileUploadService &svc,
                  const UploadRow &u, const std::string &sha,
                  const UploadReply &cb) {
    auto db = drogon::app().getDbClient();
    auto store = BlobRegistry::named("s3");
    files.uploadFile(
        db, u.filename, u.fileUuid, u.mimetype, u.size,
        FileController::isImageMimetype(u.mimetype),
        FileController::isVideoMimetype(u.mimetype),
        [=, &svc](bool ok, const std::string &) {
            if (!ok) {
                store->remove(uploadKey(u), [](BlobStatus) {});
                svc.remove(db, u.id, [](bool) {});
                return cb(uploadError("Could not store the file", 500));
            }
            svc.remove(db, u.id, [](bool) {});
            Json::Value r;
            r["success"] = true;
            r["uuid"] = u.fileUuid;
            r["filename"] = u.filename;
            r["size"] = static_cast<Json::Int64>(u.size);
            r["sha256"] = sha;
            cb(drogon::HttpResponse::newHttpJsonResponse(r));
        },
        sha, u.userId, u.tenantId, "s3");
}

} // namespace pyracms
