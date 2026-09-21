#pragma once

#include "storage/BlobStream.h"

#include <functional>
#include <memory>
#include <optional>
#include <string>

namespace pyracms {

// Where one uploaded file lives. `id` is a server-made uuid; `tenant` is 0
// for the platform site. `thumb` selects the thumbnail variant.
struct BlobKey {
    int tenant{0};
    std::string id;
    bool thumb{false};
};

enum class BlobStatus { Ok, NotFound, Failed, Unavailable };

// HTTP status and client-safe message for a failed operation (never
// carries backend detail).
int blobHttpStatus(BlobStatus s);
const char *blobMessage(BlobStatus s);

// Only [A-Za-z0-9-], 1..64 chars: keys are never built from anything else.
bool blobIdValid(const std::string &id);

// Async store for uploaded file bytes. Callbacks may run inline or on
// another thread.
class BlobStorage {
  public:
    using DoneCb = std::function<void(BlobStatus)>;
    using GetCb = std::function<void(BlobStatus, std::string)>;
    // Multipart (large objects, one part per call, never the whole file).
    using InitCb = std::function<void(BlobStatus, std::string uploadId)>;
    using PartCb = std::function<void(BlobStatus, std::string etag)>;
    virtual ~BlobStorage() = default;
    virtual const char *name() const = 0;
    virtual void put(const BlobKey &k, std::string data, DoneCb cb) = 0;
    virtual void get(const BlobKey &k, GetCb cb) = 0;
    // Removing a missing blob reports NotFound.
    virtual void remove(const BlobKey &k, DoneCb cb) = 0;
    virtual void exists(const BlobKey &k, DoneCb cb) = 0; // Ok | NotFound
    // Big objects are answered from a stream, never buffered whole. Calls
    // back with Ok and the stream once the object starts to arrive; `skip`
    // bytes are dropped and at most `length` are delivered.
    using StreamCb =
        std::function<void(BlobStatus, std::shared_ptr<BlobStream>)>;
    virtual void stream(const BlobKey &, size_t, size_t, StreamCb cb) {
        cb(BlobStatus::Failed, nullptr);
    }
    virtual bool canStream() const { return false; }
    // Stores without multipart support answer Failed.
    virtual void initMultipart(const BlobKey &, InitCb cb) {
        cb(BlobStatus::Failed, "");
    }
    virtual void putPart(const BlobKey &, const std::string &, int,
                         std::string, PartCb cb) {
        cb(BlobStatus::Failed, "");
    }
    virtual void completeMultipart(const BlobKey &, const std::string &,
                                   DoneCb cb) {
        cb(BlobStatus::Failed);
    }
    virtual void abortMultipart(const BlobKey &, const std::string &,
                                DoneCb cb) {
        cb(BlobStatus::Failed);
    }
    // Filesystem-backed stores expose the path so it can be streamed
    // (empty when the id is unusable); others return nullopt.
    virtual std::optional<std::string> path(const BlobKey &) const {
        return std::nullopt;
    }
};

} // namespace pyracms
