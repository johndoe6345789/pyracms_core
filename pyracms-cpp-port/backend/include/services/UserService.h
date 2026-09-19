#pragma once

#include "services/UserDtos.h"
#include "services/UserRole.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

class UserService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Callback = std::function<void(const std::optional<UserDto> &)>;
    using ListCallback = std::function<void(const std::vector<UserDto> &)>;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    // Accounts are scoped by tenantId (0 = platform). The same username or
    // email may exist once per scope.
    void createUser(const DbClientPtr &db, int tenantId,
                    const std::string &username, const std::string &fullName,
                    const std::string &email, const std::string &passwordHash,
                    BoolCallback cb);
    using RegisterCallback = std::function<void(
        bool success, const std::string &error, bool firstUser)>;
    // Atomic sign-up: inserts the account and, if it is the first of its
    // scope, makes it the owner (race free). `attempt` starts at 0.
    void registerAccount(const DbClientPtr &db, int tenantId,
                         const std::string &username,
                         const std::string &fullName, const std::string &email,
                         const std::string &passwordHash, int attempt,
                         RegisterCallback cb);
    void findByUsername(const DbClientPtr &db, int tenantId,
                        const std::string &username, Callback cb);
    void findById(const DbClientPtr &db, int id, Callback cb);
    void findByEmail(const DbClientPtr &db, int tenantId,
                     const std::string &email, Callback cb);
    // Scoped listing: scope -1 = all accounts, else one tenant (0 = platform).
    // `search` matches username/full name; `username` is an exact match.
    void listUsersScoped(const DbClientPtr &db, int scope,
                         const std::string &search, const std::string &username,
                         int limit, int offset, ListCallback cb);
    // "" when the profile update is acceptable, else why not.
    static std::string updateProblem(const Json::Value &updates);
    void updateUser(const DbClientPtr &db, int id, const Json::Value &updates,
                    BoolCallback cb);
    void deleteUser(const DbClientPtr &db, int id, BoolCallback cb);
    void
    getPasswordHash(const DbClientPtr &db, int tenantId,
                    const std::string &username,
                    std::function<void(const std::optional<std::string> &)> cb);
    void updatePassword(const DbClientPtr &db, int id,
                        const std::string &newHash, BoolCallback cb);
    // Role management — persists role as integer in the `role` column.
    // The role column stores the int cast of UserRole (0–4).
    using RoleCallback = std::function<void(const std::optional<UserRole> &)>;
    void getUserRole(const DbClientPtr &db, int userId, RoleCallback cb);

  private:
    UserDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
