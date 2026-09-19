#pragma once

#include <functional>
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
    virtual ~BlobStorage() = default;
    virtual const char *name() const = 0;
    virtual void put(const BlobKey &k, std::string data, DoneCb cb) = 0;
    virtual void get(const BlobKey &k, GetCb cb) = 0;
    // Removing a missing blob reports NotFound.
    virtual void remove(const BlobKey &k, DoneCb cb) = 0;
    virtual void exists(const BlobKey &k, DoneCb cb) = 0; // Ok | NotFound
    // Filesystem-backed stores expose the path so it can be streamed
    // (empty when the id is unusable); others return nullopt.
    virtual std::optional<std::string> path(const BlobKey &) const {
        return std::nullopt;
    }
};

} // namespace pyracms
