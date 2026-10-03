#pragma once

#include "controllers/HttpAliases.h"

#include <drogon/HttpController.h>

namespace pyracms {

// Platform-wide settings: domain routing mode, single-domain fallback, etc.
// Admin-only access required for write operations.
class PlatformSettingsController
    : public drogon::HttpController<PlatformSettingsController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(PlatformSettingsController::listSettings, "/api/platform/settings",
                  drogon::Get);
    ADD_METHOD_TO(PlatformSettingsController::getSetting, "/api/platform/settings/{key}",
                  drogon::Get);
    ADD_METHOD_TO(PlatformSettingsController::setSetting,
                  "/api/platform/settings/{key}", drogon::Put, PYR_JWT,
                  PYR_ADMIN);
    METHOD_LIST_END

    void listSettings(HttpReq req, HttpCbRef callback);
    void getSetting(HttpReq req, HttpCbRef callback, const std::string &key);
    void setSetting(HttpReq req, HttpCbRef callback, const std::string &key);
};

} // namespace pyracms
