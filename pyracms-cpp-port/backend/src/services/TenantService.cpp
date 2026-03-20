#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

// ── Static helpers ──────────────────────────────────────────────────────────

bool TenantService::isValidSlug(const std::string &slug) {
    if (slug.empty()) return false;
    if (slug.front() == '-' || slug.back() == '-') return false;
    for (char c : slug) {
        bool ok = (c >= 'a' && c <= 'z') ||
                  (c >= '0' && c <= '9') ||
                  c == '-';
        if (!ok) return false;
    }
    return true;
}

std::string TenantService::normalizeSlug(const std::string &name) {
    std::string result;
    result.reserve(name.size());

    for (unsigned char c : name) {
        if (std::isalnum(c)) {
            result += static_cast<char>(std::tolower(c));
        } else {
            // Replace any non-alphanumeric char with a hyphen separator
            if (!result.empty() && result.back() != '-') {
                result += '-';
            }
        }
    }

    // Strip trailing hyphen
    while (!result.empty() && result.back() == '-') {
        result.pop_back();
    }

    return result;
}

bool TenantService::isValidDisplayName(const std::string &displayName) {
    // Must contain at least one non-whitespace character
    return std::any_of(
        displayName.begin(), displayName.end(),
        [](unsigned char c) { return !std::isspace(c); });
}

// ── DB-backed methods ────────────────────────────────────────────────────────

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
