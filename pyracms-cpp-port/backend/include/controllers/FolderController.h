#pragma once

#include "controllers/HttpAliases.h"
#include "services/FolderService.h"

#include <drogon/HttpController.h>

namespace pyracms {

// Folders in the file manager. Site admins manage the folders; whoever may
// change a file (uploader or admin, OwnerFilter) may move it.
class FolderController : public drogon::HttpController<FolderController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(FolderController::list, "/api/files/folders", drogon::Get,
                  PYR_JWT, PYR_ADMIN);
    ADD_METHOD_TO(FolderController::create, "/api/files/folders", drogon::Post,
                  PYR_JWT, PYR_ADMIN);
    ADD_METHOD_TO(FolderController::remove, "/api/files/folders",
                  drogon::Delete, PYR_JWT, PYR_ADMIN);
    ADD_METHOD_TO(FolderController::move, "/api/files/{uuid}/folder",
                  drogon::Put, PYR_JWT, PYR_OWNER);
    METHOD_LIST_END

    void list(HttpReq req, HttpCbRef callback);
    void create(HttpReq req, HttpCbRef callback);
    void remove(HttpReq req, HttpCbRef callback);
    void move(HttpReq req, HttpCbRef callback, HttpStr uuid);

  private:
    FolderService folders_;
};

} // namespace pyracms
