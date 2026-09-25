#pragma once

#include "controllers/HttpAliases.h"
#include "services/TagService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class TagController : public drogon::HttpController<TagController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(TagController::cloud, "/api/tags/cloud", drogon::Get);
    ADD_METHOD_TO(TagController::setSnippetTags, "/api/snippets/{id}/tags",
                  drogon::Put, PYR_JWT);
    METHOD_LIST_END

    void cloud(HttpReq req, HttpCbRef callback);
    void setSnippetTags(HttpReq req, HttpCbRef callback, HttpStr id);

  private:
    TagService tags_;
};

} // namespace pyracms
