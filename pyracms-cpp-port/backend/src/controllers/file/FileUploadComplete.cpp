#include "controllers/FileController.h"
#include "controllers/FileUploadCommon.h"
#include "services/upload/UploadHash.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

static std::string lower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    return s;
}

// Verifies the parts add up to the declared size and that the sha256
// (folded together as the parts arrived) matches what the client
// announced, then stitches the object in the store and records the file.
void FileUploadController::complete(const drogon::HttpRequestPtr &req,
                                    UploadReply &&cb,
                                    const std::string &uploadId) {
    auto store = BlobRegistry::named("s3");
    if (!store)
        return cb(uploadError("Chunked uploads need the S3 store", 503));
    withOwnedUpload(svc_, req, uploadId, cb, [=](const UploadRow &u) {
        auto db = drogon::app().getDbClient();
        svc_.parts(db, u.id, [=](const std::vector<PartRow> &parts) {
            int64_t total = 0;
            for (auto &p : parts)
                total += p.size;
            std::string sha;
            if (!parts.empty())
                sha = shaStateFinal(parts.back().stateHex);
            const char *bad = nullptr;
            if (parts.empty() || total != u.size)
                bad = "Upload incomplete or size mismatch";
            else if (!u.expectedSha.empty() && lower(u.expectedSha) != sha)
                bad = "sha256 mismatch";
            if (bad)
                return dropUpload(svc_, u, [=]() {
                    cb(uploadError(bad, 400));
                });
            store->completeMultipart(
                uploadKey(u), u.s3Id, [=](BlobStatus s) {
                    if (s != BlobStatus::Ok)
                        return cb(blobFailure(s));
                    finishUpload(files_, svc_, u, sha, cb);
                });
        });
    });
}

} // namespace pyracms
