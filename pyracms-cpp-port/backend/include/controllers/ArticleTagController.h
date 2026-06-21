#pragma once

#include <drogon/HttpController.h>
#include "services/ArticleTagService.h"

namespace pyracms {

class ArticleTagController
    : public drogon::HttpController<ArticleTagController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ArticleTagController::listTagCloud,
                  "/api/articles/tags/cloud",
                  drogon::Get);
    METHOD_LIST_END

    void listTagCloud(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

private:
    ArticleTagService articleTagService_;
};

} // namespace pyracms
