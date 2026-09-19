#pragma once

#include "services/FileService.h"
#include "storage/BlobStorage.h"

#include <drogon/drogon.h>
#include <memory>

namespace pyracms {

using BlobStorePtr = std::shared_ptr<BlobStorage>;

// Bytes read from a store: a streamable local path, or the data itself.
struct BlobPayload {
    std::string path;
    std::string data;
};
using BlobLoadCb = std::function<void(BlobStatus, BlobPayload)>;

void loadBlob(const BlobStorePtr &store, const BlobKey &key, BlobLoadCb cb);

// Always served as a download-safe type; `attachment` adds the filename.
drogon::HttpResponsePtr blobResponse(const BlobPayload &p,
                                     const FileDto &file, bool attachment);

// JSON error for a failed storage operation (503 / 502 / 404).
drogon::HttpResponsePtr blobFailure(BlobStatus s);

} // namespace pyracms
