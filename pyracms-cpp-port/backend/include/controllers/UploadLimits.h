#pragma once

#include <cstddef>
#include <cstdint>
#include <string>

namespace pyracms {

// Size limits for uploads, read from the environment (never a request).
// A proxy such as Cloudflare caps one request body at 100 MB, so big
// files travel as parts of `uploadPartBytes()` (default 50 MiB).

// MAX_UPLOAD_MB (default 25): one request body, every route but a part.
size_t defaultBodyBytes();
// UPLOAD_PART_MB (default 50, 1..90): largest body of one part.
size_t uploadPartBytes();
// MAX_CHUNKED_UPLOAD_MB (default 1024, 1..10240): whole chunked file.
int64_t maxChunkedBytes();
// Parts needed for `size` bytes (the store allows at most 10000).
int partsFor(int64_t size);
// The one global body cap handed to drogon: the larger of the two.
size_t globalBodyBytes();
// STREAM_MIN_MB (default 8, 0 = always): stored files at least this big are
// streamed to the client instead of loaded into memory.
size_t streamMinBytes();
// True for PUT /api/files/uploads/{id}/parts/{n}.
bool isPartPath(const std::string &path);

} // namespace pyracms
