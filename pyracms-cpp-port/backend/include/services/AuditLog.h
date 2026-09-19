#pragma once

#include <drogon/HttpRequest.h>
#include <string>

namespace pyracms {

// Fire-and-forget: records an admin action. tenantId 0 = platform (stored
// as NULL). Never blocks or fails the request that caused it.
void auditLog(int tenantId, int actorId, const std::string &action,
              const std::string &target);

// Same, for the caller of `req` (JwtAuthFilter's userId) and the site
// AuditScopeFilter resolved (request attribute "auditTenant"; falls back
// to scopeTenantOf).
void auditFromRequest(const drogon::HttpRequestPtr &req,
                      const std::string &action, const std::string &target);

} // namespace pyracms
