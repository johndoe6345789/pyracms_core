#include "storage/S3Multipart.h"
#include "storage/S3Storage.h"

#include <algorithm>
#include <cctype>
namespace pyracms {

static const double kSlowS = 600; // big objects take a while

void S3Storage::initMultipart(const BlobKey &k, InitCb cb) {
    if (!blobIdValid(k.id))
        return cb(BlobStatus::Failed, "");
    ensureBucket([=](BlobStatus s) {
        if (s != BlobStatus::Ok)
            return cb(s, "");
        send(drogon::Post, objectPath(k) + "?uploads", "",
             [cb](BlobStatus r, const drogon::HttpResponsePtr &resp) {
                 auto id = r == BlobStatus::Ok
                               ? tagText(std::string(resp->body()), "UploadId")
                               : std::string();
                 if (r == BlobStatus::Ok && !uploadIdOk(id))
                     r = BlobStatus::Failed;
                 cb(r == BlobStatus::NotFound ? BlobStatus::Failed : r, id);
             });
    });
}

void S3Storage::putPart(const BlobKey &k, const std::string &uploadId, int n,
                        std::string data, PartCb cb) {
    if (!blobIdValid(k.id) || !uploadIdOk(uploadId) || n < 1 || n > 10000)
        return cb(BlobStatus::Failed, "");
    send(drogon::Put,
         objectPath(k) + "?partNumber=" + std::to_string(n) +
             "&uploadId=" + uploadId,
         std::move(data),
         [cb](BlobStatus r, const drogon::HttpResponsePtr &resp) {
             std::string etag = r == BlobStatus::Ok ? resp->getHeader("etag")
                                                    : std::string();
             etag.erase(std::remove(etag.begin(), etag.end(), '"'),
                        etag.end());
             cb(r == BlobStatus::NotFound ? BlobStatus::Failed : r, etag);
         },
         kSlowS);
}

void S3Storage::completeMultipart(const BlobKey &k,
                                  const std::string &uploadId, DoneCb cb) {
    if (!blobIdValid(k.id) || !uploadIdOk(uploadId))
        return cb(BlobStatus::Failed);
    send(drogon::Post, objectPath(k) + "?uploadId=" + uploadId, "",
         [cb](BlobStatus r, const drogon::HttpResponsePtr &) { cb(r); },
         kSlowS);
}

void S3Storage::abortMultipart(const BlobKey &k, const std::string &uploadId,
                               DoneCb cb) {
    if (!blobIdValid(k.id) || !uploadIdOk(uploadId))
        return cb(BlobStatus::Failed);
    send(drogon::Delete, objectPath(k) + "?uploadId=" + uploadId, "",
         [cb](BlobStatus r, const drogon::HttpResponsePtr &) { cb(r); });
}

} // namespace pyracms
