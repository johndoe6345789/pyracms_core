#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "services/SiteSwitch.h"

namespace pyracms {

// Create the account in one scope (tenantId 0 = platform). A site can
// close registration with its registration_open setting.
void AuthController::registerIn(int tenantId, const std::string &slug,
                                const NewAccount &acct, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    auto create = [=]() {
        userService_.registerAccount(
            db, tenantId, acct.username, acct.fullName, acct.email,
            acct.passwordHash, 0,
            [=](bool ok, const std::string &, bool first) {
                if (!ok) {
                    // Same text whether name or email clashed
                    sendError(callback,
                              slug.empty()
                                  ? "That username or email is already taken"
                                  : "That username or email is already "
                                    "taken on this site",
                              drogon::k409Conflict);
                    return;
                }
                registerDone(tenantId, slug, acct.username, first, callback);
            });
    };
    if (tenantId == 0)
        return create();
    whenSwitchedOff(db, tenantId, "registration_open", [=](bool closed) {
        if (closed)
            return sendError(callback, "Registration is closed on this site",
                             drogon::k403Forbidden);
        create();
    });
}

} // namespace pyracms
