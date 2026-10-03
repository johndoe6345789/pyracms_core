#include "controllers/DomainController.h"

#include <drogon/drogon.h>

namespace pyracms {

void DomainController::siteForDomain(HttpReq req, HttpCbRef callback) {
    auto host = req->getHeader("host");
    if (host.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Missing Host header";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    // Strip port if present (e.g., "example.com:3000" -> "example.com")
    size_t colonPos = host.find(':');
    if (colonPos != std::string::npos) {
        host = host.substr(0, colonPos);
    }

    auto db = drogon::app().getDbClient();

    // First, fetch the routing mode from platform settings
    db->execSqlAsync(
        "SELECT value FROM platform_settings WHERE key = 'domain_routing_mode'",
        [db, host, callback](const drogon::orm::Result &modeRows) {
            std::string routingMode = "multi-domain";
            if (!modeRows.empty()) {
                routingMode = modeRows[0]["value"].as<std::string>();
            }

            if (routingMode == "single-domain") {
                // Single-domain mode: return all sites, indicate domain routing is disabled
                db->execSqlAsync(
                    "SELECT id, slug, display_name, description, owner_id, created_at, "
                    "       primary_domain FROM tenants ORDER BY slug",
                    [callback, host](const drogon::orm::Result &rows) {
                        Json::Value result;
                        result["routingMode"] = "single-domain";
                        result["domain"] = host;
                        result["sites"] = Json::arrayValue;
                        for (const auto &row : rows) {
                            Json::Value site;
                            site["id"] = row["id"].as<int>();
                            site["slug"] = row["slug"].as<std::string>();
                            site["displayName"] = row["display_name"].as<std::string>();
                            site["description"] = row["description"].as<std::string>();
                            site["primaryDomain"] = row["primary_domain"].as<std::string>();
                            result["sites"].append(site);
                        }
                        callback(drogon::HttpResponse::newHttpJsonResponse(result));
                    },
                    [callback](const drogon::orm::DrogonDbException &) {
                        auto resp =
                            drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = "Database error";
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                    });
            } else {
                // Multi-domain mode: map this domain to a specific site
                db->execSqlAsync(
                    "SELECT t.id, t.slug, t.display_name, t.description, t.owner_id, "
                    "       t.created_at "
                    "FROM tenants t "
                    "LEFT JOIN tenant_domains td ON t.id = td.tenant_id "
                    "WHERE td.domain = $1 OR t.primary_domain = $1 "
                    "LIMIT 1",
                    [callback, host](const drogon::orm::Result &rows) {
                        Json::Value result;
                        result["routingMode"] = "multi-domain";
                        result["domain"] = host;
                        if (rows.empty()) {
                            result["siteFound"] = false;
                            callback(drogon::HttpResponse::newHttpJsonResponse(result));
                            return;
                        }

                        auto row = rows[0];
                        result["siteFound"] = true;
                        result["id"] = row["id"].as<int>();
                        result["slug"] = row["slug"].as<std::string>();
                        result["displayName"] = row["display_name"].as<std::string>();
                        result["description"] = row["description"].as<std::string>();
                        result["ownerId"] = row["owner_id"].as<int>();
                        result["createdAt"] = row["created_at"].as<std::string>();
                        callback(drogon::HttpResponse::newHttpJsonResponse(result));
                    },
                    [callback](const drogon::orm::DrogonDbException &) {
                        auto resp =
                            drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = "Database error";
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                    },
                    host);
            }
        },
        [callback](const drogon::orm::DrogonDbException &) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        });
}

void DomainController::listAllSites(HttpReq req, HttpCbRef callback) {
    auto db = drogon::app().getDbClient();
    tenantService_.listTenants(
        db, [callback](const std::vector<TenantDto> &tenants) {
            Json::Value result(Json::arrayValue);
            for (const auto &t : tenants) {
                Json::Value item;
                item["id"] = t.id;
                item["slug"] = t.slug;
                item["displayName"] = t.displayName;
                item["description"] = t.description;
                item["ownerId"] = t.ownerId;
                item["createdAt"] = t.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
