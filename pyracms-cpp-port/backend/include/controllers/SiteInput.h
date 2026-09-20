#pragma once

#include "security/Validate.h"
#include "services/TenantService.h"

#include <json/json.h>
#include <string>

namespace pyracms {

// Empty string when slug, displayName and description are acceptable,
// else the message for a 400. The slug becomes part of URLs and of login
// scoping: lowercase letters, digits and hyphens, and not a reserved word.
inline std::string siteProblem(const Json::Value &j) {
    if (!j.isObject() || !j.isMember("slug") || !j.isMember("displayName"))
        return "slug and displayName required";
    if (!j["slug"].isString() || !j["displayName"].isString() ||
        !j.get("description", "").isString())
        return "slug, displayName and description must be text";
    static const char *reserved[] = {"api",    "admin",  "www", "platform",
                                     "static", "site",   "null"};
    auto slug = j["slug"].asString();
    for (const char *r : reserved)
        if (slug == r)
            return "Invalid site slug, name or description";
    auto name = j["displayName"].asString();
    auto desc = j.get("description", "").asString();
    if (slug.size() > 63 || !TenantService::isValidSlug(slug) ||
        !TenantService::isValidDisplayName(name) ||
        !isBoundedText(name, 128) || !isBoundedText(desc, 2000))
        return "Invalid site slug, name or description";
    return "";
}

} // namespace pyracms
