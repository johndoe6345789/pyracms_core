#include "services/TenantService.h"

namespace pyracms {

TenantDto TenantService::rowToDto(const drogon::orm::Row &row) {
    TenantDto dto;
    dto.id = row["id"].as<int>();
    dto.slug = row["slug"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description = row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.ownerId = row["owner_id"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

void TenantService::createTenant(const DbClientPtr &db,
                                  const std::string &slug,
                                  const std::string &displayName,
                                  const std::string &description,
                                  int ownerId,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO tenants (slug, display_name, description, owner_id, created_at) "
        "VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        slug, displayName, description, ownerId);
}

void TenantService::findBySlug(const DbClientPtr &db,
                                const std::string &slug,
                                Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM tenants WHERE slug = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        slug);
}

void TenantService::listTenants(const DbClientPtr &db, ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM tenants ORDER BY display_name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<TenantDto> tenants;
            tenants.reserve(result.size());
            for (const auto &row : result) {
                tenants.push_back(rowToDto(row));
            }
            cb(tenants);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        });
}

void TenantService::deleteTenant(const DbClientPtr &db, int id,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM tenants WHERE id = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

} // namespace pyracms
