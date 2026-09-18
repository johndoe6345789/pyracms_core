#pragma once

#include "controllers/BoolReply.h"
#include "services/gamedep/GdTypes.h"
#include <drogon/HttpRequest.h>

namespace pyracms {

// Read context: optional viewer identity, tenant from token or ?tenant_id.
GdCtx gdReadCtx(const drogon::HttpRequestPtr &req);
// Write context: identity set by JwtAuthFilter.
GdCtx gdWriteCtx(const drogon::HttpRequestPtr &req);
// Adapts a service result into the HTTP response.
GdCb gdReply(HttpCb callback);
// Request JSON body, or an empty object.
Json::Value gdBody(const drogon::HttpRequestPtr &req);
// "http://host" from Forwarded/Host headers.
std::string gdBaseUrl(const drogon::HttpRequestPtr &req);
// Parses ?limit / ?offset style ints (fallback on junk).
int gdInt(const std::string &text, int fallback);

} // namespace pyracms
