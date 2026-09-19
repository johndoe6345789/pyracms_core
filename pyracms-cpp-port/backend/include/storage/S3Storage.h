#pragma once

#include "storage/BlobStorage.h"
#include "storage/StorageConfig.h"

#include <atomic>
#include <drogon/HttpClient.h>
#include <memory>
#include <mutex>

namespace pyracms {

// Files in an S3-compatible object store (johndoe6345789/object-store
// dialect: path-style URLs, "Authorization: AWS <access>:<secret>").
// Objects live at <bucket>/tenants/<tenant>/[thumbnails/]<uuid>. The bucket
// is created on first use. The endpoint comes from the environment only.
class S3Storage : public BlobStorage {
  public:
    explicit S3Storage(StorageConfig cfg);
    const char *name() const override { return "s3"; }
    void put(const BlobKey &k, std::string data, DoneCb cb) override;
    void get(const BlobKey &k, GetCb cb) override;
    void remove(const BlobKey &k, DoneCb cb) override;
    void exists(const BlobKey &k, DoneCb cb) override;

  private:
    using ReplyCb =
        std::function<void(BlobStatus, const drogon::HttpResponsePtr &)>;
    std::string objectPath(const BlobKey &k) const;
    drogon::HttpClientPtr client();
    void send(drogon::HttpMethod m, const std::string &path,
              std::string body, ReplyCb cb);
    void ensureBucket(DoneCb cb);
    void putOnce(const BlobKey &k, std::shared_ptr<std::string> data,
                 bool retry, DoneCb cb);

    StorageConfig cfg_;
    S3Endpoint ep_;
    std::mutex mu_;
    drogon::HttpClientPtr client_;
    std::atomic<bool> bucketReady_{false};
};

} // namespace pyracms
