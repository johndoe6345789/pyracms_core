#pragma once

#include "controllers/SettingsController.h"
#include "filters/AdminFilter.h"
#include "filters/Viewer.h"
#include "security/Validate.h"
#include "services/UserRole.h"

namespace pyracms {

// Credential-like settings (names such as *secret*, *password*, *key*) are
// shown to site administrators and the site's owner only; everything else
// is public site config.
inline void withAdminFlag(const drogon::HttpRequestPtr &req, int tenantId,
                          std::function<void(bool)> next) {
    int viewer = viewerIdFor(req, tenantId);
    if (viewer == 0) {
        next(false);
        return;
    }
    AdminFilter::roleLookup()(viewer, [=](std::optional<int> role) {
        if (role && *role >= static_cast<int>(UserRole::SiteAdmin))
            return next(true);
        // The site's owner keeps the stored role User.
        AdminFilter::ownerLookup()(viewer, tenantId, next);
    });
}

} // namespace pyracms
