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

} // namespace pyracms
