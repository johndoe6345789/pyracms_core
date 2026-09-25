#pragma once

#include "storage/BlobStorage.h"
#include "storage/StorageConfig.h"

#include <atomic>
#include <chrono>
#include <drogon/HttpClient.h>
#include <memory>
#include <mutex>

namespace pyracms {

// Files in an S3-compatible object store (johndoe6345789/object-store
// path-style URLs, AWS Signature V4 on every request).
// Objects live at <bucket>/tenant-<site>-[thumb-]<uuid> (the store has flat
// keys; site 0 = platform). The bucket
// is created on first use. The endpoint comes from the environment only.
class S3Storage : public BlobStorage {
  public:
    explicit S3Storage(StorageConfig cfg);
    const char *name() const override { return "s3"; }
    void put(const BlobKey &k, std::string data, DoneCb cb) override;
    void get(const BlobKey &k, GetCb cb) override;
    void remove(const BlobKey &k, DoneCb cb) override;
    void exists(const BlobKey &k, DoneCb cb) override;
    void stream(const BlobKey &k, size_t skip, size_t length,
                StreamCb cb) override;
    bool canStream() const override { return true; }
    // Presigned GET URL on S3_PUBLIC_ENDPOINT, "" unless enabled.
    std::string presignedUrl(const BlobKey &k, int expiresS = 300) const;
    void initMultipart(const BlobKey &k, InitCb cb) override;
    void putPart(const BlobKey &k, const std::string &uploadId, int n,
                 std::string data, PartCb cb) override;
    void completeMultipart(const BlobKey &k, const std::string &uploadId,
                           DoneCb cb) override;
    void abortMultipart(const BlobKey &k, const std::string &uploadId,
                        DoneCb cb) override;

  private:
    using ReplyCb =
        std::function<void(BlobStatus, const drogon::HttpResponsePtr &)>;
    std::string objectPath(const BlobKey &k) const;
    // A fresh connection when the last one sat idle or just failed.
    drogon::HttpClientPtr client();
    void dropClient(const drogon::HttpClientPtr &dead);
    // `path` may carry a query; timeout 0 = the configured default.
    void send(drogon::HttpMethod m, const std::string &path,
              std::string body, ReplyCb cb, double timeout = 0);
    void ensureBucket(DoneCb cb);
    void putOnce(const BlobKey &k, std::shared_ptr<std::string> data,
                 bool retry, DoneCb cb);

    StorageConfig cfg_;
    S3Endpoint ep_;
    std::mutex mu_;
    drogon::HttpClientPtr client_;
    std::chrono::steady_clock::time_point lastUse_{};
    std::atomic<bool> bucketReady_{false};
};

} // namespace pyracms
