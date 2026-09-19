#include "services/gamedep/GdVisibility.h"

namespace pyracms {

std::string gdManagerSql() {
    return "(p.owner_id = $3 OR COALESCE((SELECT role FROM users "
           "WHERE id = $3), 0) >= 3 OR EXISTS (SELECT 1 FROM tenants tn "
           "WHERE tn.id = p.tenant_id AND tn.owner_id = $3))";
}

std::string gdPageVisibleSql() {
    return "((NOT p.is_private AND EXISTS (SELECT 1 FROM "
           "gamedep_revisions pr WHERE pr.page_id = p.id AND "
           "pr.published)) OR " + gdManagerSql() + ")";
}

bool gdParseVisibility(const Json::Value &body, bool &isPrivate) {
    if (body.isMember("isPrivate") && body["isPrivate"].isBool()) {
        isPrivate = body["isPrivate"].asBool();
        return true;
    }
    if (body.isMember("visibility") && body["visibility"].isString()) {
        auto v = body["visibility"].asString();
        if (v == "private" || v == "public") {
            isPrivate = v == "private";
            return true;
        }
    }
    return false;
}

} // namespace pyracms
