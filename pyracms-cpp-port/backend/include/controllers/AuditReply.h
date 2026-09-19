#pragma once

#include "controllers/BoolReply.h"
#include "services/AuditLog.h"

#include <drogon/HttpRequest.h>

namespace pyracms {

// boolReply that also writes an audit_log row when the action succeeded.
inline BoolCb auditedReply(const drogon::HttpRequestPtr &req, HttpCb callback,
                           std::string action, std::string target) {
    auto reply = boolReply(std::move(callback));
    return [req, reply, action, target](bool ok, const std::string &err) {
        if (ok)
            auditFromRequest(req, action, target);
        reply(ok, err);
    };
}

} // namespace pyracms
