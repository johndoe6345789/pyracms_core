#pragma once

#include "controllers/HttpAliases.h"

#include <drogon/HttpController.h>

namespace pyracms {

// The admin panel's "Search Indexing" section: how the index stands, and a
// way to rebuild this site's part of it.
class SearchAdminController
    : public drogon::HttpController<SearchAdminController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SearchAdminController::status, "/api/admin/search",
                  drogon::Get, PYR_JWT, PYR_ADMIN);
    ADD_METHOD_TO(SearchAdminController::reindex,
                  "/api/admin/search/reindex", drogon::Post, PYR_JWT,
                  PYR_ADMIN);
    METHOD_LIST_END

    void status(HttpReq req, HttpCbRef callback);
    void reindex(HttpReq req, HttpCbRef callback);
};

} // namespace pyracms
