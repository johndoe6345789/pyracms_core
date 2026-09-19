#pragma once

#include "controllers/BoolReply.h"

#include <drogon/HttpRequest.h>

// Short spellings for controller declarations. HttpCbRef is exactly the
// callback type Drogon's handler traits expect.
namespace pyracms {

using HttpReq = const drogon::HttpRequestPtr &;
using HttpCbRef = HttpCb &&;
using HttpStr = const std::string &;

} // namespace pyracms

// Filter names for ADD_METHOD_TO.
#define PYR_JWT "pyracms::JwtAuthFilter"
#define PYR_ADMIN "pyracms::AdminFilter"
#define PYR_OWNER "pyracms::OwnerFilter"
#define PYR_RATE "pyracms::RateLimitFilter"
