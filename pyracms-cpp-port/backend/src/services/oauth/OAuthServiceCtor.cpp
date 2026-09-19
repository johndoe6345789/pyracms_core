#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

OAuthService::OAuthService() {
    loadConfig();
}

} // namespace pyracms
