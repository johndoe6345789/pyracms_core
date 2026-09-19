#include "filters/Viewer.h"

#include "services/AuthService.h"

namespace pyracms {

Viewer viewerOf(const drogon::HttpRequestPtr &req) {
    auto header = req->getHeader("Authorization");
    if (header.substr(0, 7) != "Bearer ")
        return {};
    AuthService auth;
    auto payload = auth.verifyToken(header.substr(7));
    if (!payload)
        return {};
    return {payload->userId, payload->tenantId};
}

int viewerIdFor(const drogon::HttpRequestPtr &req, int tenantId) {
    auto v = viewerOf(req);
    return (v.tenantId == 0 || v.tenantId == tenantId) ? v.userId : 0;
}

} // namespace pyracms
