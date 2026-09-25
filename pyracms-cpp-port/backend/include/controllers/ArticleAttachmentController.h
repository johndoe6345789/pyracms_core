#pragma once

#include "controllers/HttpAliases.h"
#include "services/ArticleAttachmentService.h"
#include "services/ArticleService.h"

#include <drogon/HttpController.h>

namespace pyracms {

// Downloads that belong to an article. Listing follows the article's own
// visibility; adding and removing need the article owner (OwnerFilter).
class ArticleAttachmentController
    : public drogon::HttpController<ArticleAttachmentController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ArticleAttachmentController::list,
                  "/api/articles/{name}/attachments", drogon::Get);
    ADD_METHOD_TO(ArticleAttachmentController::add,
                  "/api/articles/{name}/attachments", drogon::Post, PYR_JWT,
                  PYR_OWNER);
    ADD_METHOD_TO(ArticleAttachmentController::remove,
                  "/api/articles/{name}/attachments/{attachmentId}",
                  drogon::Delete, PYR_JWT, PYR_OWNER);
    METHOD_LIST_END

    void list(HttpReq req, HttpCbRef callback, HttpStr name);
    void add(HttpReq req, HttpCbRef callback, HttpStr name);
    void remove(HttpReq req, HttpCbRef callback, HttpStr name,
                HttpStr attachmentId);

  private:
    ArticleService articleService_;
    ArticleAttachmentService attachments_;
};

} // namespace pyracms
