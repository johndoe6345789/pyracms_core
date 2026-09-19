#pragma once

#include "controllers/HttpAliases.h"

#include <drogon/HttpController.h>

namespace pyracms {

class AuditController : public drogon::HttpController<AuditController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuditController::list, "/api/audit", drogon::Get, PYR_JWT,
                  PYR_ADMIN);
    METHOD_LIST_END

    void list(HttpReq req, HttpCbRef callback);
};

} // namespace pyracms
