#pragma once

#include <drogon/HttpController.h>

namespace pyracms {

class DocsController : public drogon::HttpController<DocsController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(DocsController::swaggerUi, "/api/docs", drogon::Get);
    ADD_METHOD_TO(DocsController::openapiSpec, "/api/openapi.yaml", drogon::Get);
    METHOD_LIST_END

    void swaggerUi(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void openapiSpec(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);
};

} // namespace pyracms
