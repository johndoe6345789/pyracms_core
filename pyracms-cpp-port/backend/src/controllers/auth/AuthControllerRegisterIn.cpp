#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "services/SiteSwitch.h"

namespace pyracms {

// Create a Normal User in one site. Platform accounts are not created by
// sign-up (the first one comes from first-run setup). A site can close
// registration with its registration_open setting.
void AuthController::registerIn(int tenantId, const std::string &slug,
                                const NewAccount &acct, HttpCb callback) {
    if (tenantId == 0)
        return sendError(callback,
                         "Sign up on a site; the platform account is "
                         "created during setup",
                         drogon::k403Forbidden);
    auto db = drogon::app().getDbClient();
    auto create = [=]() {
        userService_.registerAccount(
            db, tenantId, acct.username, acct.fullName, acct.email,
            acct.passwordHash, [=](bool ok, const std::string &) {
                if (!ok)
                    // Same text whether name or email clashed
                    return sendError(callback,
                                     "That username or email is already "
                                     "taken on this site",
                                     drogon::k409Conflict);
                registerDone(tenantId, slug, acct.username, false, callback);
            });
    };
    whenSwitchedOff(db, tenantId, "registration_open", [=](bool closed) {
        if (closed)
            return sendError(callback, "Registration is closed on this site",
                             drogon::k403Forbidden);
        create();
    });
}

} // namespace pyracms
