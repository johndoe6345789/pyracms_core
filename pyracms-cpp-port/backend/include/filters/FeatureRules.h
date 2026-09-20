#pragma once

#include <optional>
#include <string>

namespace pyracms {

// Feature toggles (site setting "feature_<id>"). A feature is ENABLED
// unless its setting is explicitly "false" for the tenant, so sites that
// never touched the toggles keep working. A disabled feature is closed to
// everyone on the public API (404), admins included.

// Feature id owning an API path; "" = not feature-gated.
inline std::string featureOfPath(const std::string &path) {
    struct Route {
        const char *prefix;
        const char *feature;
    };
    static const Route routes[] = {
        {"/api/articles", "articles"},
        {"/api/forum", "forum"},
        {"/api/gallery", "gallery"},
        {"/api/snippets", "code_snippets"},
        {"/api/gamedep", "hypernucleus"},
        {"/api/outputs", "hypernucleus"},
        {"/api/operating-systems", "hypernucleus"},
        {"/api/architectures", "hypernucleus"},
    };
    for (const auto &r : routes) {
        std::string p = r.prefix;
        if (path.compare(0, p.size(), p) == 0 &&
            (path.size() == p.size() || path[p.size()] == '/'))
            return r.feature;
    }
    return "";
}

// Stored setting value (nullopt = never set) -> enabled?
inline bool featureEnabled(const std::optional<std::string> &value) {
    return !value || *value != "false";
}

} // namespace pyracms
