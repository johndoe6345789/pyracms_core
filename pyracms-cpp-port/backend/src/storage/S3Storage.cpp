#include "storage/S3Storage.h"

namespace pyracms {

// 409 means the bucket already exists, which is what we want.
void S3Storage::ensureBucket(DoneCb cb) {
    if (bucketReady_)
        return cb(BlobStatus::Ok);
    send(drogon::Put, "/" + cfg_.bucket, "",
         [this, cb](BlobStatus s, const drogon::HttpResponsePtr &resp) {
             bool exists = resp && resp->statusCode() == drogon::k409Conflict;
             if (s == BlobStatus::Ok || exists) {
                 bucketReady_ = true;
                 return cb(BlobStatus::Ok);
             }
             cb(s == BlobStatus::NotFound ? BlobStatus::Failed : s);
         });
}

// A 404 on the object PUT means the bucket vanished: recreate, retry once.
void S3Storage::putOnce(const BlobKey &k, std::shared_ptr<std::string> data,
                        bool retry, DoneCb cb) {
    ensureBucket([=](BlobStatus s) {
        if (s != BlobStatus::Ok)
            return cb(s);
        send(drogon::Put, objectPath(k), *data,
             [=](BlobStatus r, const drogon::HttpResponsePtr &) {
                 if (r == BlobStatus::NotFound && retry) {
                     bucketReady_ = false;
                     return putOnce(k, data, false, cb);
                 }
                 cb(r == BlobStatus::NotFound ? BlobStatus::Failed : r);
             });
    });
}

void S3Storage::put(const BlobKey &k, std::string data, DoneCb cb) {
    if (!blobIdValid(k.id))
        return cb(BlobStatus::Failed);
    putOnce(k, std::make_shared<std::string>(std::move(data)), true,
            std::move(cb));
}

void S3Storage::get(const BlobKey &k, GetCb cb) {
    if (!blobIdValid(k.id))
        return cb(BlobStatus::NotFound, "");
    send(drogon::Get, objectPath(k), "",
         [cb](BlobStatus s, const drogon::HttpResponsePtr &resp) {
             cb(s, s == BlobStatus::Ok ? std::string(resp->body())
                                       : std::string());
         });
}

void S3Storage::remove(const BlobKey &k, DoneCb cb) {
    if (!blobIdValid(k.id))
        return cb(BlobStatus::NotFound);
    send(drogon::Delete, objectPath(k), "",
         [cb](BlobStatus s, const drogon::HttpResponsePtr &) { cb(s); });
}

void S3Storage::exists(const BlobKey &k, DoneCb cb) {
    if (!blobIdValid(k.id))
        return cb(BlobStatus::NotFound);
    send(drogon::Head, objectPath(k), "",
         [cb](BlobStatus s, const drogon::HttpResponsePtr &) { cb(s); });
}

} // namespace pyracms
