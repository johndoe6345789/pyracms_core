#pragma once

#include "controllers/HttpAliases.h"
#include "services/AuthService.h"
#include "services/TenantService.h"
#include "services/UserService.h"

#include <drogon/HttpController.h>

namespace pyracms {

// Self-service site creation: whoever creates a site becomes that site's
// Administrator (and owner), with an account that exists only on that site.
class SiteSignupController
    : public drogon::HttpController<SiteSignupController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SiteSignupController::create, "/api/sites", drogon::Post,
                  PYR_RATE);
    METHOD_LIST_END

    void create(HttpReq req, HttpCbRef callback);

  private:
    void finish(int tenantId, HttpStr slug, HttpStr username, HttpCb callback);

    TenantService tenantService_;
    AuthService authService_;
    UserService userService_;
};

} // namespace pyracms
