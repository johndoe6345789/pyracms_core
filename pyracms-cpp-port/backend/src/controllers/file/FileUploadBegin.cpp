#include "controllers/FileController.h"
#include "controllers/FileUploadCommon.h"
#include "controllers/FileRules.h"
#include "controllers/UploadLimits.h"
#include "filters/TenantGuard.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

static const int kMaxOpenPerUser = 10;

static bool shaShape(std::string &sha) {
    std::transform(sha.begin(), sha.end(), sha.begin(), ::tolower);
    return sha.empty() ||
           (sha.size() == 64 &&
            sha.find_first_not_of("0123456789abcdef") == std::string::npos);
}

// Same rules as POST /api/files (safe name, server-side type), sized for
// the chunked limit; the object is created under a server-made uuid.
void FileUploadController::begin(const drogon::HttpRequestPtr &req,
                                 UploadReply &&cb) {
    auto json = req->getJsonObject();
    if (!json || !(*json)["filename"].isString() ||
        !(*json)["size"].isIntegral())
        return cb(uploadError("filename and size are required", 400));
    UploadRow u;
    u.filename = safeFilename((*json)["filename"].asString());
    u.size = (*json)["size"].asInt64();
    u.expectedSha = (*json).get("sha256", "").asString();
    if (u.size <= 0 || !shaShape(u.expectedSha))
        return cb(uploadError("Invalid size or sha256", 400));
    if (u.size > maxChunkedBytes())
        return cb(uploadError("File too large", 413));
    auto store = BlobRegistry::named("s3");
    if (!store)
        return cb(uploadError("Chunked uploads need the S3 store", 503));
    u.mimetype = FileController::mimeFor(u.filename);
    u.userId = req->attributes()->get<int>("userId");
    u.tenantId = tokenTenantOf(req);
    u.id = drogon::utils::getUuid();
    u.fileUuid = drogon::utils::getUuid();
    auto db = drogon::app().getDbClient();
    svc_.countOpen(db, u.userId, [=](int open) mutable {
        if (open >= kMaxOpenPerUser)
            return cb(uploadError("Too many uploads in progress", 429));
        store->initMultipart(uploadKey(u), [=](BlobStatus s,
                                               std::string s3Id) mutable {
            if (s != BlobStatus::Ok)
                return cb(blobFailure(s));
            u.s3Id = s3Id;
            svc_.create(db, u, [=](bool ok) {
                if (!ok)
                    return dropUpload(svc_, u, [cb]() {
                        cb(uploadError("Could not start upload", 500));
                    });
                Json::Value r;
                r["uploadId"] = u.id;
                r["partSize"] = static_cast<Json::UInt64>(uploadPartBytes());
                r["maxParts"] = partsFor(u.size);
                cb(drogon::HttpResponse::newHttpJsonResponse(r));
            });
        });
    });
}

} // namespace pyracms
