#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace pyracms {

// Outcome of a game/dep service call: an HTTP status plus a JSON body.
struct GdResult {
    int status{200};
    Json::Value body;
};
using GdCb = std::function<void(const GdResult &)>;

// Who is calling and where. scope = tenant id (0 = platform site).
struct GdCtx {
    drogon::orm::DbClientPtr db;
    int scope{0};
    int userId{0};
    std::string base; // "http://host" prefix for download urls
};

GdResult gdError(int status, const std::string &message);
GdResult gdOk(int status = 200);
// Postgres error text -> 409 (duplicate) or 400.
GdResult gdDbError(const std::string &what);
bool gdValidType(const std::string &type);

// Resolve a page the caller may change; 404 / 403 through `fail`.
void gdWithPage(const GdCtx &c, const std::string &type,
                const std::string &name, bool write,
                std::function<void(int pageId)> ok, GdCb fail);
// Same, plus a revision addressed by version string.
void gdWithRevision(const GdCtx &c, const std::string &type,
                    const std::string &name, const std::string &ver,
                    std::function<void(int pageId, int revId)> ok,
                    GdCb fail);
// files.id for a numeric id or uuid in a request body (0 = none).
void gdFileId(const GdCtx &c, const Json::Value &body,
              std::function<void(int fileId)> ok, GdCb fail);

} // namespace pyracms
