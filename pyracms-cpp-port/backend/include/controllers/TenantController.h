#pragma once

#include <drogon/HttpController.h>
#include "services/TenantService.h"

namespace pyracms {

class TenantController : public drogon::HttpController<TenantController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(TenantController::list, "/api/tenants", drogon::Get);
    ADD_METHOD_TO(TenantController::getBySlug, "/api/tenants/{slug}", drogon::Get);
    ADD_METHOD_TO(TenantController::create, "/api/tenants", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(TenantController::remove, "/api/tenants/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getBySlug(const drogon::HttpRequestPtr &req,
                   std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                   const std::string &slug);

    void create(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void remove(const drogon::HttpRequestPtr &req,
                std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                int id);

private:
    TenantService tenantService_;
};

} // namespace pyracms
