#include "controllers/UserAdminGate.h"
#include "filters/TenantGuard.h"

namespace pyracms {

AdminActor actorOf(const drogon::HttpRequestPtr &req) {
    auto a = req->attributes();
    return {a->get<int>("userId"), a->get<int>("role"),
            a->get<int>("tenantId")};
}

void withAdminTarget(const drogon::HttpRequestPtr &req, int id, ReplyFn reply,
                     std::function<void(const AdminCtx &)> go) {
    auto actor = actorOf(req);
    if (!isAdminRole(actor.role) && actor.id != id)
        return reply(filterError("Administrator role required",
                                 drogon::k403Forbidden));
    static UserAdminService svc;
    svc.loadTarget(drogon::app().getDbClient(), id,
                   [=](const std::optional<AdminTarget> &t, bool banned) {
                       // Foreign accounts look absent (404 from the rules).
                       if (!t) {
                           reply(filterError("User not found",
                                             drogon::k404NotFound));
                           return;
                       }
                       go({actor, *t, banned});
                   });
}

void replyVerdict(const AdminVerdict &v, const ReplyFn &reply) {
    reply(filterError(v.message,
                      static_cast<drogon::HttpStatusCode>(v.status)));
}

void replyOk(const ReplyFn &reply) {
    Json::Value out;
    out["success"] = true;
    reply(drogon::HttpResponse::newHttpJsonResponse(out));
}

} // namespace pyracms
