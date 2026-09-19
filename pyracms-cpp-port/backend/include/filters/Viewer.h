#pragma once

#include <drogon/HttpRequest.h>

namespace pyracms {

// Optional identity of the caller on routes that are not behind
// JwtAuthFilter (anonymous -> both 0). Reads the Bearer token if present.
struct Viewer {
    int userId{0};
    int tenantId{0};
};

Viewer viewerOf(const drogon::HttpRequestPtr &req);

// The viewer's id for reading content of `tenantId`; 0 (anonymous) when
// the bearer belongs to a different site, so foreign tokens gain nothing.
int viewerIdFor(const drogon::HttpRequestPtr &req, int tenantId);

} // namespace pyracms
