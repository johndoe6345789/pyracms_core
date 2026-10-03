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

    // Query: Get domain config + site info
    // Per-domain display_mode:
    //   'single': show only this domain's bound site
    //   'multi': show all available sites (splash screen)
    db->execSqlAsync(
        "SELECT t.id, t.slug, t.display_name, t.description, t.owner_id, "
        "       t.created_at, td.display_mode, td.display_mode_description "
        "FROM tenants t "
        "LEFT JOIN tenant_domains td ON t.id = td.tenant_id "
        "WHERE td.domain = $1 OR t.primary_domain = $1 "
        "LIMIT 1",
        [db, host, callback](const drogon::orm::Result &rows) {
            if (rows.empty()) {
                // Domain not found
                Json::Value result;
                result["domainFound"] = false;
                result["domain"] = host;
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
                return;
            }

            auto row = rows[0];
            std::string displayMode = row["display_mode"].isNull()
                ? "single"
                : row["display_mode"].as<std::string>();

            if (displayMode == "multi") {
                // Multi-site mode on this domain: return all sites
                db->execSqlAsync(
                    "SELECT id, slug, display_name, description, owner_id, created_at "
                    "FROM tenants ORDER BY slug",
                    [callback, host, displayMode](const drogon::orm::Result &siteRows) {
                        Json::Value result;
                        result["domainFound"] = true;
                        result["domain"] = host;
                        result["displayMode"] = displayMode;
                        result["allSites"] = Json::arrayValue;

                        for (const auto &siteRow : siteRows) {
                            Json::Value site;
                            site["id"] = siteRow["id"].as<int>();
                            site["slug"] = siteRow["slug"].as<std::string>();
                            site["displayName"] = siteRow["display_name"].as<std::string>();
                            site["description"] = siteRow["description"].as<std::string>();
                            result["allSites"].append(site);
                        }
                        callback(drogon::HttpResponse::newHttpJsonResponse(result));
                    },
                    [callback](const drogon::orm::DrogonDbException &) {
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                        (*resp->jsonObject())["error"] = "Database error";
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                    });
            } else {
                // Single-site mode on this domain: return only this site
                Json::Value result;
                result["domainFound"] = true;
                result["domain"] = host;
                result["displayMode"] = displayMode;
                result["siteFound"] = true;
                result["id"] = row["id"].as<int>();
                result["slug"] = row["slug"].as<std::string>();
                result["displayName"] = row["display_name"].as<std::string>();
                result["description"] = row["description"].as<std::string>();
                result["ownerId"] = row["owner_id"].as<int>();
                result["createdAt"] = row["created_at"].as<std::string>();
                callback(drogon::HttpResponse::newHttpJsonResponse(result));
            }
        },
        [callback](const drogon::orm::DrogonDbException &) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
            (*resp->jsonObject())["error"] = "Database error";
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        host);
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
