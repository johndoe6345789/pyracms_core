#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Create the account in one scope (tenantId 0 = platform).
void AuthController::registerIn(int tenantId, const std::string &slug,
                                const NewAccount &acct, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    // Counting existing accounts lets the UI greet the first one
    userService_.countUsers(db, tenantId, [=](int count) {
        userService_.createUser(
            db, tenantId, acct.username, acct.fullName, acct.email,
            acct.passwordHash, [=](bool ok, const std::string &) {
                if (!ok) {
                    // A unique-index violation is the common case
                    sendError(callback,
                              slug.empty()
                                  ? "That username or email is already taken"
                                  : "That username or email is already "
                                    "taken on this site",
                              drogon::k409Conflict);
                    return;
                }
                registerDone(tenantId, slug, acct.username, count, callback);
            });
    });
}

} // namespace pyracms
