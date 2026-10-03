#pragma once

#include "controllers/HttpAliases.h"
#include "services/TenantService.h"

#include <drogon/HttpController.h>

namespace pyracms {

// Map domains to sites; expose site config for the current domain
class DomainController : public drogon::HttpController<DomainController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(DomainController::siteForDomain, "/api/domain/site", drogon::Get);
    ADD_METHOD_TO(DomainController::listAllSites, "/api/sites", drogon::Get);
    ADD_METHOD_TO(DomainController::checkDomainRedirect, "/api/domain/redirect", drogon::Get);
    METHOD_LIST_END

    void siteForDomain(HttpReq req, HttpCbRef callback);
    void listAllSites(HttpReq req, HttpCbRef callback);
    void checkDomainRedirect(HttpReq req, HttpCbRef callback);

  private:
    TenantService tenantService_;
};

} // namespace pyracms
