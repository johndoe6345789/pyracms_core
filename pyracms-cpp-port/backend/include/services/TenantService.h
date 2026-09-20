#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct TenantDto {
    int id;
    std::string slug;
    std::string displayName;
    std::string description;
    int ownerId;
    std::string createdAt;
};

class TenantService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Callback =
        std::function<void(const std::optional<TenantDto> &)>;
    using ListCallback =
        std::function<void(const std::vector<TenantDto> &)>;
    using BoolCallback =
        std::function<void(bool, const std::string &)>;

    // Pure-logic slug helpers — no DB required, safe to unit test
    // isValidSlug: accepts only lowercase letters, digits, and hyphens;
    // must not be empty, start/end with a hyphen, or contain spaces
    static bool isValidSlug(const std::string &slug);

    // displayName must not be empty (validated before calling createTenant)
    static bool isValidDisplayName(const std::string &displayName);

    void createTenant(const DbClientPtr &db,
                      const std::string &slug,
                      const std::string &displayName,
                      const std::string &description,
                      int ownerId,
                      BoolCallback cb);

    // Self-service site creation in three steps: an ownerless site, its
    // founding administrator (UserService::createFounder), then owner_id.
    // A failed founder step calls discard so no empty site is left behind.
    using IdCallback = std::function<void(int id, const std::string &error)>;
    void createEmpty(const DbClientPtr &db, const std::string &slug,
                     const std::string &displayName,
                     const std::string &description, IdCallback cb);
    void adoptFounder(const DbClientPtr &db, int tenantId, BoolCallback cb);
    void discard(const DbClientPtr &db, int tenantId);

    void findBySlug(const DbClientPtr &db,
                    const std::string &slug,
                    Callback cb);

    void listTenants(const DbClientPtr &db, ListCallback cb);

    // Owner or super-admin only; "Not found" when nothing was deleted.
    void deleteTenant(const DbClientPtr &db, int id, int actingUserId,
                      BoolCallback cb);

private:
    TenantDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
