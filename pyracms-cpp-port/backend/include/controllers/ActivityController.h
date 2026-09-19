#pragma once

#include "controllers/HttpAliases.h"

#include <drogon/HttpController.h>

namespace pyracms {

class ActivityController : public drogon::HttpController<ActivityController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ActivityController::list, "/api/activity", drogon::Get);
    METHOD_LIST_END

    void list(HttpReq req, HttpCbRef callback);
};

} // namespace pyracms
