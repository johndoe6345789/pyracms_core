#include "controllers/TagController.h"
#include "filters/TenantGuard.h"
#include "services/TagRules.h"

namespace pyracms {

void TagController::setSnippetTags(HttpReq req, HttpCbRef callback,
                                   HttpStr id) {
    auto json = req->getJsonObject();
    if (!json || !(*json)["tags"].isArray() || id.empty() || id.size() > 9 ||
        id.find_first_not_of("0123456789") != std::string::npos)
        return callback(
            filterError("tags must be a list", drogon::k400BadRequest));
    std::vector<std::string> raw;
    for (const auto &t : (*json)["tags"]) {
        if (!t.isString())
            return callback(filterError("tags must be text",
                                        drogon::k400BadRequest));
        raw.push_back(t.asString());
    }
    auto tags = normalizeTags(raw);
    tags_.setSnippetTags(
        drogon::app().getDbClient(), std::stoi(id),
        req->attributes()->get<int>("userId"), tags,
        [callback, tags](bool ok, const std::string &error) {
            if (!ok)
                return callback(filterError(error, drogon::k404NotFound));
            Json::Value r;
            r["tags"] = Json::Value(Json::arrayValue);
            for (const auto &t : tags)
                r["tags"].append(t);
            callback(drogon::HttpResponse::newHttpJsonResponse(r));
        });
}

} // namespace pyracms
