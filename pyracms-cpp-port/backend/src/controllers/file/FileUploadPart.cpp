#include "controllers/FileUploadCommon.h"
#include "controllers/FileRules.h"
#include "controllers/UploadLimits.h"
#include "services/upload/UploadHash.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

static void partReply(const UploadReply &cb, int n, size_t size,
                             const std::string &etag) {
    Json::Value r;
    r["part"] = n;
    r["size"] = static_cast<Json::UInt64>(size);
    r["etag"] = etag;
    cb(drogon::HttpResponse::newHttpJsonResponse(r));
}

// The body is one part (at most UPLOAD_PART_MB). It is forwarded to the
// store and folded into the running sha256; parts must arrive in order,
// and re-sending one is safe (an identical part is a no-op).
void FileUploadController::part(const drogon::HttpRequestPtr &req,
                                UploadReply &&cb,
                                const std::string &uploadId, int n) {
    if (req->body().empty())
        return cb(uploadError("Empty part", 400));
    if (req->body().size() > uploadPartBytes())
        return cb(uploadError("Part too large", 413));
    auto store = BlobRegistry::named("s3");
    if (!store)
        return cb(uploadError("Chunked uploads need the S3 store", 503));
    withOwnedUpload(svc_, req, uploadId, cb, [=](const UploadRow &u) {
        auto db = drogon::app().getDbClient();
        svc_.parts(db, u.id, [=](const std::vector<PartRow> &parts) {
            std::string body(req->body());
            auto md5 = md5Hex(body);
            auto plan = planPart(parts, n, body.size(), md5, u.size);
            if (plan.action == PartAction::Duplicate)
                return partReply(cb, n, body.size(), md5);
            if (plan.action == PartAction::OutOfOrder)
                return cb(uploadError("Send parts in order", 409));
            if (plan.action == PartAction::TooMuch)
                return cb(uploadError("More data than declared", 400));
            if (n == 1 && !magicMatches(fileExtension(u.filename),
                                        body.substr(0, 16)))
                return cb(uploadError("File content does not match its "
                                      "type", 415));
            PartRow row{n, static_cast<int64_t>(body.size()), md5,
                        shaStateUpdate(plan.prevState, body)};
            store->putPart(
                uploadKey(u), u.s3Id, n, std::move(body),
                [=](BlobStatus s, std::string etag) {
                    if (s != BlobStatus::Ok)
                        return cb(blobFailure(s));
                    if (etag != md5)
                        return cb(uploadError("Store checksum mismatch",
                                              502));
                    svc_.savePart(db, u.id, row, [=](bool ok) {
                        if (!ok)
                            return cb(
                                uploadError("Could not save part", 500));
                        partReply(cb, n, row.size, md5);
                    });
                });
        });
    });
}

} // namespace pyracms
