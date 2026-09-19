#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Create the account in one scope (tenantId 0 = platform).
void AuthController::registerIn(int tenantId, const std::string &slug,
                                const NewAccount &acct, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    userService_.registerAccount(
        db, tenantId, acct.username, acct.fullName, acct.email,
        acct.passwordHash, 0,
        [=](bool ok, const std::string &, bool first) {
            if (!ok) {
                // Deliberately the same text whether name or email clashed
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
}

} // namespace pyracms
