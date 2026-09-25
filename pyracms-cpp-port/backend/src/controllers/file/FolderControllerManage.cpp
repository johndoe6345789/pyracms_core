#include "controllers/FolderController.h"
#include "controllers/QueryInt.h"
#include "filters/TenantGuard.h"
#include "services/FolderRules.h"

namespace pyracms {

namespace {
int siteOf(HttpReq req) { return queryInt(req->getParameter("tenant_id"), 0); }

drogon::HttpResponsePtr bad(const std::string &m) {
    return filterError(m, drogon::k400BadRequest);
}

// success -> `ok`; "not empty" -> 409; anything else -> 404.
FolderService::BoolCallback answer(HttpCb callback, const char *ok) {
    return [callback, ok](bool success, const std::string &error) {
        if (success) {
            Json::Value r;
            r["message"] = ok;
            return callback(drogon::HttpResponse::newHttpJsonResponse(r));
        }
        callback(filterError(error, error == "The folder is not empty"
                                        ? drogon::k409Conflict
                                        : drogon::k404NotFound));
    };
}
} // namespace

void FolderController::list(HttpReq req, HttpCbRef callback) {
    if (siteOf(req) <= 0)
        return callback(bad("tenant_id is required"));
    folders_.list(drogon::app().getDbClient(), siteOf(req),
                  [callback](const std::vector<std::string> &all) {
                      Json::Value out(Json::arrayValue);
                      for (const auto &p : all)
                          out.append(p);
                      callback(drogon::HttpResponse::newHttpJsonResponse(out));
                  });
}

void FolderController::create(HttpReq req, HttpCbRef callback) {
    auto json = req->getJsonObject();
    auto path = json && (*json)["path"].isString()
                    ? normalizeFolder((*json)["path"].asString())
                    : std::nullopt;
    if (siteOf(req) <= 0 || !path || path->empty())
        return callback(bad("A tenant_id and a folder path are required"));
    folders_.create(drogon::app().getDbClient(), siteOf(req), *path,
                    answer(callback, "Folder created"));
}

void FolderController::remove(HttpReq req, HttpCbRef callback) {
    auto path = normalizeFolder(req->getParameter("path"));
    if (siteOf(req) <= 0 || !path || path->empty())
        return callback(bad("A tenant_id and a folder path are required"));
    folders_.remove(drogon::app().getDbClient(), siteOf(req), *path,
                    answer(callback, "Folder removed"));
}

void FolderController::move(HttpReq req, HttpCbRef callback, HttpStr uuid) {
    auto json = req->getJsonObject();
    auto folder = json && (*json)["folder"].isString()
                      ? normalizeFolder((*json)["folder"].asString())
                      : std::nullopt;
    if (!folder)
        return callback(bad("folder must be a path like photos/2024"));
    folders_.move(drogon::app().getDbClient(), uuid, *folder,
                  answer(callback, "File moved"));
}

} // namespace pyracms
