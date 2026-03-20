#pragma once

#include "services/UserRole.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct UserDto {
    int id;
    std::string username;
    std::string fullName;
    std::string email;
    std::string website;
    std::string aboutme;
    std::string timezone;
    bool banned;
    std::string createdAt;
    std::string apiUuid;
    // Role stored as the integer value of UserRole; defaults to User (1)
    UserRole role{UserRole::User};
};

class UserService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Callback = std::function<void(const std::optional<UserDto> &)>;
    using ListCallback = std::function<void(const std::vector<UserDto> &)>;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    void createUser(const DbClientPtr &db,
                    const std::string &username,
                    const std::string &fullName,
                    const std::string &email,
                    const std::string &passwordHash,
                    BoolCallback cb);

    void findByUsername(const DbClientPtr &db,
                       const std::string &username,
                       Callback cb);

    void findById(const DbClientPtr &db, int id, Callback cb);

    void findByEmail(const DbClientPtr &db,
                     const std::string &email,
                     Callback cb);

    void listUsers(const DbClientPtr &db, int limit, int offset,
                   ListCallback cb);

    void updateUser(const DbClientPtr &db, int id,
                    const Json::Value &updates,
                    BoolCallback cb);

    void deleteUser(const DbClientPtr &db, int id, BoolCallback cb);

    void getPasswordHash(const DbClientPtr &db,
                         const std::string &username,
                         std::function<void(const std::optional<std::string> &)> cb);

    void updatePassword(const DbClientPtr &db, int id,
                        const std::string &newHash,
                        BoolCallback cb);

    void countUsers(const DbClientPtr &db,
                    std::function<void(int)> cb);

    // Role management — persists role as integer in the `role` column.
    // The role column stores the int cast of UserRole (0–4).
    using RoleCallback =
        std::function<void(const std::optional<UserRole> &)>;

    void setUserRole(const DbClientPtr &db,
                     int userId,
                     UserRole role,
                     BoolCallback cb);

    void getUserRole(const DbClientPtr &db,
                     int userId,
                     RoleCallback cb);

private:
    UserDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
