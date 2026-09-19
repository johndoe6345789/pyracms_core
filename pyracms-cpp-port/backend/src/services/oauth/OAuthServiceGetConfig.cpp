#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

OAuthProviderConfig OAuthService::getConfig(const std::string &provider) {
    auto it = configs_.find(provider);
    if (it != configs_.end())
        return it->second;
    return {};
}

} // namespace pyracms
