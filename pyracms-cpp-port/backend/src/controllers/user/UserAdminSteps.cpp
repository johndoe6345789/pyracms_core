#include "controllers/UserAdminGate.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void runSteps(std::shared_ptr<std::vector<Step>> steps, size_t i,
              ReplyFn reply) {
    if (i == steps->size())
        return replyOk(reply);
    (*steps)[i]([=](bool ok, const std::string &err) {
        if (!ok)
            return reply(filterError(err, drogon::k400BadRequest));
        runSteps(steps, i + 1, reply);
    });
}

Json::Value profileOf(const Json::Value &b, bool self) {
    Json::Value p(Json::objectValue);
    for (const char *k :
         {"fullName", "email", "website", "aboutme", "timezone"}) {
        bool adminField = std::string(k) == "fullName" ||
                          std::string(k) == "email";
        if (b.isMember(k) && (self || adminField))
            p[k] = b[k];
    }
    return p;
}

} // namespace pyracms
