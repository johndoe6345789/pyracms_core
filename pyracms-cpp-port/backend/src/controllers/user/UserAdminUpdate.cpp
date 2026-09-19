#include "controllers/UserAdminGate.h"
#include "filters/TenantGuard.h"


namespace pyracms {


// Edit / ban / role in one request; every change is checked first, then
// applied in order.
void adminUpdate(const drogon::HttpRequestPtr &req, int id,
                 const Json::Value &body, ReplyFn reply, UserService &users) {
    if ((body.isMember("role") && !body["role"].isInt()) ||
        (body.isMember("banned") && !body["banned"].isBool()))
        return reply(filterError("role must be an integer, banned a boolean",
                                 drogon::k400BadRequest));
    bool self = req->attributes()->get<int>("userId") == id;
    for (const char *k : {"website", "aboutme", "timezone"}) {
        if (!self && body.isMember(k))
            return reply(filterError("Only name, email, ban and role can be "
                                     "changed for another account",
                                     drogon::k403Forbidden));
    }
    withAdminTarget(req, id, reply, [=, &users](auto &c) {
        auto db = drogon::app().getDbClient();
        auto steps = std::make_shared<std::vector<Step>>();
        auto profile = profileOf(body, c.actor.id == id);
        auto refuse = [&](AdminAction a, int role = -1) {
            auto v = canAdminister(c.actor, c.target, a, role);
            if (!v.ok())
                replyVerdict(v, reply);
            return !v.ok();
        };
        if (!profile.empty()) {
            if (refuse(AdminAction::Edit))
                return;
            steps->push_back([=, &users](auto cb) {
                users.updateUser(db, id, profile, cb);
            });
        }
        if (body.isMember("role") && body["role"].asInt() != c.target.role) {
            int role = body["role"].asInt();
            if (refuse(AdminAction::SetRole, role))
                return;
            steps->push_back([=](auto cb) {
                UserAdminService().setRole(db, id, role, cb);
            });
        }
        if (body.isMember("banned") && body["banned"].asBool() != c.banned) {
            if (refuse(AdminAction::Ban))
                return;
            bool b = body["banned"].asBool();
            steps->push_back([=](auto cb) {
                UserAdminService().setBanned(db, id, b, cb);
            });
        }
        if (steps->empty())
            return reply(filterError("No fields to update",
                                     drogon::k400BadRequest));
        runSteps(steps, 0, reply);
    });
}

} // namespace pyracms
