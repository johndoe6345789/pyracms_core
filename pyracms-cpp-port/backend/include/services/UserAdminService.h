#pragma once

#include "filters/UserAdminRules.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

// Data access for administering other accounts. Rules live in
// filters/UserAdminRules.h; these only read and write.
class UserAdminService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using TargetCb = std::function<void(const std::optional<AdminTarget> &,
                                        bool banned)>;
    using BoolCb = std::function<void(bool ok, const std::string &error)>;

    // Role, tenant, site-owner and last-platform-owner facts of one
    // account; nullopt when it does not exist.
    void loadTarget(const DbClientPtr &db, int id, TargetCb cb);

    // Both stamp token_valid_after, ending the account's old sessions.
    void setBanned(const DbClientPtr &db, int id, bool banned, BoolCb cb);
    void setRole(const DbClientPtr &db, int id, int role, BoolCb cb);
};

} // namespace pyracms
