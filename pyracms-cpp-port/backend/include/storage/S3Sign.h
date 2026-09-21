#pragma once

#include "storage/SigV4.h"
#include "storage/StorageConfig.h"

#include <string>
#include <utility>
#include <vector>

namespace pyracms {

using HeaderList = std::vector<std::pair<std::string, std::string>>;

// The Host header value: origin without scheme, default port dropped
// (exactly what the HTTP client puts on the wire).
std::string s3HostHeader(const S3Endpoint &ep);

// Headers that make one request a signed S3 request: Host, x-amz-date,
// x-amz-content-sha256 and Authorization. `target` is the wire path
// including any "?query". The body is hashed in memory (parts <= 50 MiB).
HeaderList s3SignedHeaders(const StorageConfig &cfg, const S3Endpoint &ep,
                           const std::string &method,
                           const std::string &target,
                           const std::string &body);

// Presigned GET URL (query auth, host-only signed header). `publicEp` is
// the externally reachable endpoint; `path` is "/bucket/key".
std::string s3PresignedGetUrl(const StorageConfig &cfg,
                              const S3Endpoint &publicEp,
                              const std::string &path, int expiresS,
                              const std::string &amzDate);

} // namespace pyracms
