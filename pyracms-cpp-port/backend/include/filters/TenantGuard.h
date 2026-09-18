#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <string>
#include <vector>

namespace pyracms {

// Tenant ids named by the request (query string and JSON body).
std::vector<std::string> namedTenants(const drogon::HttpRequestPtr &req);

// Tenant id of the authenticated token; 0 = platform (or unauthenticated).
int tokenTenantOf(const drogon::HttpRequestPtr &req);

// JSON 403/401 response helper shared by filters.
drogon::HttpResponsePtr filterError(const std::string &message,
                                    drogon::HttpStatusCode code);

} // namespace pyracms
