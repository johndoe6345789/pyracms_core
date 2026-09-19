#pragma once

#include "services/AuthService.h"

#include <drogon/HttpRequest.h>
#include <optional>
#include <string>

namespace pyracms {

// One place that authenticates WebSocket upgrades. Uses the same
// AuthService (secret, issuer, algorithm, expiry) as every HTTP route, so
// the socket can never accept a token the API would refuse.
// Browsers cannot set headers on a WebSocket, so `?token=` is accepted as
// well as "Authorization: Bearer"; keep proxy access logs free of query
// strings.
std::optional<TokenPayload> wsAuthenticate(const drogon::HttpRequestPtr &req);

// Room names: 1-64 of [A-Za-z0-9_.:-], else "".
std::string sanitizeRoom(const std::string &raw);

} // namespace pyracms
