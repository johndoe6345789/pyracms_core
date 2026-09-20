#include "filters/TenantGuard.h"

namespace pyracms {

std::vector<std::string> namedTenants(const drogon::HttpRequestPtr &req) {
    std::vector<std::string> out;
    for (const char *k : {"tenant_id", "tenantId"}) {
        out.push_back(req->getParameter(k));
    }
    auto body = req->getJsonObject();
    if (!body || !body->isObject())
        return out;
    for (const char *k : {"tenant_id", "tenantId"}) {
        if (body->isMember(k) &&
            (*body)[k].isConvertibleTo(Json::stringValue)) {
            out.push_back((*body)[k].asString());
        }
    }
    return out;
}

int tokenTenantOf(const drogon::HttpRequestPtr &req) {
    auto attrs = req->attributes();
    return attrs->find("tenantId") ? attrs->get<int>("tenantId") : 0;
}

int scopeTenantOf(const drogon::HttpRequestPtr &req) {
    auto attrs = req->attributes();
    return attrs->find("scopeTenant") ? attrs->get<int>("scopeTenant")
                                      : tokenTenantOf(req);
}

drogon::HttpResponsePtr filterError(const std::string &message,
                                    drogon::HttpStatusCode code) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
    (*resp->jsonObject())["error"] = message;
    resp->setStatusCode(code);
    return resp;
}

} // namespace pyracms
