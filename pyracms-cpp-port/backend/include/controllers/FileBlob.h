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

// Gate for game/dep files by page visibility (see GdFileAccess): calls
// `allowed`, or answers 404 itself. Non-game files always pass.
void withFileAccess(const drogon::HttpRequestPtr &req,
                    const drogon::orm::DbClientPtr &db,
                    const std::string &uuid,
                    const std::function<void(const drogon::HttpResponsePtr &)>
                        &callback,
                    std::function<void()> allowed);

void loadBlob(const BlobStorePtr &store, const BlobKey &key, BlobLoadCb cb);

// Always served as a download-safe type; `attachment` adds the filename.
drogon::HttpResponsePtr blobResponse(const BlobPayload &p,
                                     const FileDto &file, bool attachment);

// blobResponse plus Range (206/416), ETag / If-None-Match (304) and
// Accept-Ranges, so a client can resume a download. `thumb` marks a
// thumbnail variant (its own ETag).
drogon::HttpResponsePtr serveBlob(const drogon::HttpRequestPtr &req,
                                  const BlobPayload &p, const FileDto &file,
                                  bool attachment, bool thumb);

// Big stored files are piped to the client instead of being loaded whole
// (see STREAM_MIN_MB); same headers and status codes as serveBlob.
using StreamReply = std::function<void(const drogon::HttpResponsePtr &)>;
bool wantsStream(const FileDto &file, const BlobStorePtr &store);
void streamBlob(const drogon::HttpRequestPtr &req, const BlobStorePtr &store,
                const FileDto &file, StreamReply cb);

// JSON error for a failed storage operation (503 / 502 / 404).
drogon::HttpResponsePtr blobFailure(BlobStatus s);

} // namespace pyracms
