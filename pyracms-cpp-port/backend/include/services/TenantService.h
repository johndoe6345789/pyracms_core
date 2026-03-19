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
    using Callback = std::function<void(const std::optional<TenantDto> &)>;
    using ListCallback = std::function<void(const std::vector<TenantDto> &)>;
    using BoolCallback = std::function<void(bool, const std::string &)>;

    void createTenant(const DbClientPtr &db,
                      const std::string &slug,
                      const std::string &displayName,
                      const std::string &description,
                      int ownerId,
                      BoolCallback cb);

    void findBySlug(const DbClientPtr &db,
                    const std::string &slug,
                    Callback cb);

    void listTenants(const DbClientPtr &db, ListCallback cb);

    void deleteTenant(const DbClientPtr &db, int id, BoolCallback cb);

private:
    TenantDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
