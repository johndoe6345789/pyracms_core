#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace pyracms {

// Whether a stored file may be served to this caller.
//   Open   - not part of any game/dep page: the existing uuid-capability
//            rules apply unchanged.
//   Public - belongs to a public game/dep (binary, source archive,
//            screenshot): anyone may download it, signed in or not.
//   Denied - belongs only to private/unpublished game content and the
//            caller does not manage it. Served as 404.
enum class GdFileAccess { Open, Public, Denied };

// viewerId 0 = anonymous. viewerTenant = tenant claim of the token
// (0 = platform); a token of another site never counts as a manager.
void gdFileAccess(const drogon::orm::DbClientPtr &db,
                  const std::string &uuid, int viewerId, int viewerTenant,
                  std::function<void(GdFileAccess)> cb);

} // namespace pyracms
