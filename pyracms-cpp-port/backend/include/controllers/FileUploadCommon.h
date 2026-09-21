#pragma once

#include "controllers/FileBlob.h"
#include "controllers/FileUploadController.h"
#include "storage/BlobStorage.h"

namespace pyracms {

inline BlobKey uploadKey(const UploadRow &u) {
    return BlobKey{u.tenantId, u.fileUuid, false};
}

// Runs `ok` with the upload when it exists and belongs to the caller (same
// user and site); otherwise answers 404 (never a hint it exists).
void withOwnedUpload(FileUploadService &svc,
                     const drogon::HttpRequestPtr &req,
                     const std::string &uploadId, const UploadReply &cb,
                     std::function<void(const UploadRow &)> ok);

// Abort the multipart upload in the store and forget the row.
void dropUpload(FileUploadService &svc, const UploadRow &u,
                std::function<void()> done);

// The object is complete in the store: record the files row and answer
// like POST /api/files (removes the object again if the row fails).
void finishUpload(FileService &files, FileUploadService &svc,
                  const UploadRow &u, const std::string &sha,
                  const UploadReply &cb);

drogon::HttpResponsePtr uploadError(const std::string &msg, int status);

} // namespace pyracms
