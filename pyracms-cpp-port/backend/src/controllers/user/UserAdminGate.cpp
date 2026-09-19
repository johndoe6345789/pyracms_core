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
    bool admin = isAdminRole(actor.role) || actor.id == id;
    static UserAdminService svc;
    svc.loadTarget(drogon::app().getDbClient(), id,
                   [=](const std::optional<AdminTarget> &t, bool banned) {
                       // Neither an admin nor the site's owner: refuse
                       // without revealing whether the account exists.
                       if (!admin && !(t && t->actorOwnsTenant)) {
                           reply(filterError("Administrator role required",
                                             drogon::k403Forbidden));
                           return;
                       }
                       // Foreign accounts look absent (404 from the rules).
                       if (!t) {
                           reply(filterError("User not found",
                                             drogon::k404NotFound));
                           return;
                       }
                       go({actor, *t, banned});
                   },
                   actor.id);
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
